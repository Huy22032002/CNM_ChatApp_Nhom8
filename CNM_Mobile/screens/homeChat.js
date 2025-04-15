import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Text,
  Alert,
  Image,
  Modal,
  Button,
} from "react-native";
import axios from "axios";
import { useSelector } from "react-redux";
import { fetchUserDetail } from "../api/userDetailApi";
import ConversationApi from "../api/conversationApi";

export default function HomeChat({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [userInfo, setUserInfo] = useState(null);
  const [userDetail, setUserDetail] = useState(null);

  const [conversations, setConversations] = useState([]);

  //lay user va token tu redux
  const user = useSelector((state) => state.user.user);
  const accessToken = useSelector((state) => state.user.accessToken);

  useEffect(() => {
    setUserInfo(user);
    getUserDetail();
    getListConversation();
  }, [user]);
  const getListConversation = async () => {
    const data = await ConversationApi.fetchConversationsByUserId(
      user.id,
      accessToken
    );
    if (data) {
      setConversations(data);
    }
  };
  const getUserDetail = async () => {
    const data = await fetchUserDetail(user.id, accessToken);
    console.log("data fetch userdetail:", data);
    setUserDetail(data);
  };
  const changePassword = async () => {
    try {
      const id = user.id;
      if (!id) {
        Alert.alert("Lỗi", "Không tìm thấy ID người dùng");
        return;
      }
      if (!oldPassword || !password || !confirmPassword) {
        Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
        return;
      }

      try {
        // Gọi check mật khẩu cũ
        const res = await axios.post(
          "http://10.0.2.2:3000/api/users/checkMatchPassword",
          {
            username: userInfo?.username,
            password: oldPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (res.status !== 200) {
          Alert.alert("Lỗi", "Mật khẩu cũ không chính xác!");
          return;
        }
      } catch (error) {
        if (error.response?.status === 401) {
          Alert.alert("Lỗi", "Mật khẩu cũ không chính xác!");
          return;
        } else {
          Alert.alert("Lỗi", "Đã xảy ra lỗi, vui lòng thử lại!");
          return;
        }
      }

      await axios.post(
        `http://10.0.2.2:3000/api/users/updatePassword/`,
        {
          id: userInfo?.id,
          password: password,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      Alert.alert("Thành công", "Đã đổi mật khẩu thành công");
      setShowChangePassword(false);
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        Alert.alert(
          "Lỗi",
          err.response.data.message || "Mật khẩu cũ không chính xác!"
        );
      } else {
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi đổi mật khẩu");
      }
      console.error(err);
    }
  };
  const logout = async () => {
    try {
      await axios.post(
        "http://10.0.2.2:3000/auth/logout",
        {
          id: userInfo?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      Alert.alert("Thành công", "Đã đăng xuất thành công");
      navigation.navigate("login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error.message);
      Alert.alert("Lỗi", "Không thể đăng xuất");
    }
  };
  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      {
        text: "Huỷ",
        onPress: () => console.log("Huỷ"),
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        onPress: () => {
          logout();
        },
      },
    ]);
  };
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {
        navigation.navigate("chatScreen", {
          conversation_id: item.conversation_id,
        });
      }}
    >
      <Image
        source={item.avatar || require("../assets/user1.png")}
        style={styles.avatar}
      />
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.conversation_id}</Text>
        <Text style={styles.chatMsg}>{item.lastMessage.content}</Text>
        <Text>{item.lastMessage.updated_at}</Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>
          Xin chào, {userDetail?.fullname || "User"} 👋
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("findUser")}>
          <Image
            source={
              userDetail?.avatar_url
                ? { uri: userDetail.avatar_url }
                : require("../assets/default-avatar.png")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Image
            source={
              userDetail?.avatar_url
                ? { uri: userDetail.avatar_url }
                : require("../assets/default-avatar.png")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              setShowChangePassword(true);
            }}
          >
            <Text style={styles.menuItem}>Đổi mật khẩu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate("profile");
            }}
          >
            <Text style={styles.menuItem}>Trang cá nhân</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              handleLogout();
            }}
          >
            <Text style={styles.menuItem}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        placeholder="Tìm kiếm"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.conversation_id.toString()}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
      <Modal visible={showChangePassword} transparent animationType="slide">
        <View style={styles.modalView}>
          <Text style={{ marginBottom: 10 }}>Mật khẩu cũ:</Text>
          <TextInput
            placeholder="Mật khẩu cũ"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
            style={styles.input}
          />
          <Text style={{ marginBottom: 10 }}>Mật khẩu mới:</Text>
          <TextInput
            placeholder="Mật khẩu mới"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <Text style={{ marginBottom: 10 }}>Xác nhận mật khẩu mới:</Text>
          <TextInput
            placeholder="Xác nhận mật khẩu mới"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />
          <Button title="Xác nhận" onPress={changePassword} />
          <Button
            title="Huỷ"
            color="gray"
            onPress={() => setShowChangePassword(false)}
          />
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  header: { fontSize: 20, fontWeight: "bold" },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  menu: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    position: "absolute",
    right: 16,
    top: 70,
    zIndex: 999,
  },
  menuItem: {
    paddingVertical: 8,
    fontSize: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0066cc",
  },
  activeTab: {
    backgroundColor: "#0066cc",
  },
  tabText: {
    color: "#0066cc",
  },
  activeTabText: {
    color: "#fff",
  },
  chatItem: {
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  chatContent: {
    marginLeft: 12,
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chatMsg: {
    fontSize: 14,
    color: "gray",
  },
  modalView: {
    backgroundColor: "white",
    marginHorizontal: 20,
    padding: 20,
    marginTop: "40%",
    borderRadius: 8,
    elevation: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
});
