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
  ScrollView,
} from "react-native";
import axios from "axios";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from '@react-navigation/native';



import { fetchUserDetail } from "../api/userDetailApi";


const DATA = {
  friends: [
    {
      id: "1",
      name: "Huy",
      message: "Hình ảnh nè!",
      avatar: require("../assets/user1.png"),
    },
    {
      id: "2",
      name: "Hoàng",
      message: "Đã gọi cho con rồi nha",
      avatar: require("../assets/user2.png"),
    },
    {
      id: "3",
      name: "Hải",
      message: "Gửi hình hôm qua",
      avatar: require("../assets/user3.png"),
    },
  ],
  groups: [
    {
      id: "101",
      name: "111 Lê Đức Thọ - 1",
      message: "Thanh Vy: Hình ảnh nè!",
      avatar: require("../assets/group1.png"),
    },
    {
      id: "102",
      name: "Le and Friends English Club",
      message: "Chị Hằng: Ảnh đẹp nè!",
      avatar: require("../assets/group2.png"),
    },
  ],
};

export default function HomeChat({ navigation }) {
  navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState("friends");
  const [menuVisible, setMenuVisible] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [userInfo, setUserInfo] = useState(null);
  const [userDetail, setUserDetail] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendRequestsDetails, setFriendRequestsDetails] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);


  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://10.0.2.2:3000/api/notifications/${user.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setNotifications(res.data); // [{ message, type, status }]
    } catch (err) {
      console.error("Lỗi khi lấy thông báo:", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`http://10.0.2.2:3000/api/notifications/unread-count/${user.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUnreadCount(res.data); // [{ message, type, status }]
    } catch (err) {
      console.error("Lỗi khi lấy thông báo:", err);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await axios.put(`http://10.0.2.2:3000/api/notifications/mark-read/${user.id}`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUnreadCount(0);
    } catch (err) {
      console.error("Lỗi khi đánh dấu đã đọc:", err);
    }
  };

  const handleBellPress = () => {
    const newShow = !showNotifications;
    setShowNotifications(newShow);
    if (!showNotifications) {
      markAllAsRead();
    }
  };

  const handleFriendPress = () => {
    const newShow = !showFriendRequests;
    setShowFriendRequests(newShow);
  };

  const fetchFriendRequests = async () => {
    try {
      const res = await axios.get(`http://10.0.2.2:3000/api/friends/requests/${user.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFriendRequests(res.data); // [{ message, type, status }]
      console.log("Lời mời kết bạn:", res.data);
      
      // Fetch details for each friend request
      const detailsPromises = res.data.map(async (request) => {
        const userDetail = await fetchUserDetail(request.friend_id, accessToken);
        return {
          ...request,
          userDetail
        };
      });
      
      const details = await Promise.all(detailsPromises);
      setFriendRequestsDetails(details);
    } catch (err) {
      console.error("Lỗi khi lấy lời mời kết bạn:", err);
    }
  };

  const acceptFriendRequest = async (friend_id) => {
    try {
      await axios.post(`http://10.0.2.2:3000/api/friends/accept`, 
        {
          user_id: user.id,
          friend_id,
        }, 
        {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      handleFriendPress();
    } catch (err) {
      console.error("Lỗi khi chấp nhận kết bạn", err);
    }
  };

  const cancelFriendRequest = async (friend_id) => {
    try {
      await axios.post(`http://10.0.2.2:3000/api/friends/cancel-request`, 
        {
          user_id: user.id,
          friend_id,
        }, 
        {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      handleFriendPress();
    } catch (err) {
      console.error("Lỗi khi từ chối kết bạn", err);
    }
  };
  
  const filteredData = DATA[tab].filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  //lay user va token tu redux
  const user = useSelector((state) => state.user.user);
  const accessToken = useSelector((state) => state.user.accessToken);

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
  useEffect(() => {
    setUserInfo(user);
    getUserDetail();
    fetchNotifications();
    fetchUnreadCount();
    fetchFriendRequests();
  }, [user]);
  const getUserDetail = async () => {
    const data = await fetchUserDetail(user.id, accessToken);
    if (data.error) {
      alert("Lỗi", data.error);
      setUserDetail(null);
      // navigation.navigate("login");
      handleLogout();
      return;
    }
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
  
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem}>
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatMsg}>{item.message}</Text>
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
          <Icon name="search" size={24} color="#000" />
        </TouchableOpacity>

        <View style={{ position: "relative", marginLeft: 10 }}>
          <TouchableOpacity onPress={handleBellPress}>
            <Icon name="bell" size={24} color="#333" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {showNotifications && (
            <View style={styles.dropdown}>
              <ScrollView style={{ maxHeight: 200 }}>
                {notifications.length === 0 ? (
                  <Text style={styles.emptyText}>Không có thông báo</Text>
                ) : (
                  notifications.map((noti, index) => (
                    <View key={index} style={styles.notiItem}>
                      <Text style={styles.notiMessage}>{noti.message}</Text>
                      <Text style={styles.notiType}>{noti.type}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          )}
          
          
        </View>

        <TouchableOpacity onPress={handleFriendPress}>
            <Icon name="user-plus" size={24} color="#333" />
          </TouchableOpacity>

          {showFriendRequests && (
            <View style={styles.dropdown}>
              <ScrollView style={{ maxHeight: 200 }}>
                {friendRequests.length === 0 ? (
                  <Text style={styles.emptyText}>Không có lời mời kết bạn</Text>
                ) : (
                  friendRequests.map((request, index) => (
                    <View key={index} style={styles.notiItem}>
                      <Image
                        source={request.userDetail?.avatar_url ? { uri: request.userDetail.avatar_url } : require("../assets/default-avatar.png")}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                      />
                      <Text style={styles.notiMessage}>{request.userDetail?.fullname || request.name}</Text>
                      <Button
                        title="Chấp nhận"
                        onPress={() => {
                          acceptFriendRequest(request.friend_id);
                          console.log("Chấp nhận lời mời từ id:", request.friend_id);
                        }}
                      />
                      <Button
                        title="Từ chối"
                        onPress={() => {
                          cancelFriendRequest(request.friend_id);
                          console.log("Từ chối lời mời từ id:", request.friend_id);
                        }}
                      />
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          )}
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

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, tab === "friends" && styles.activeTab]}
          onPress={() => setTab("friends")}
        >
          <Text
            style={tab === "friends" ? styles.activeTabText : styles.tabText}
          >
            Bạn bè
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === "groups" && styles.activeTab]}
          onPress={() => setTab("groups")}
        >
          <Text
            style={tab === "groups" ? styles.activeTabText : styles.tabText}
          >
            Nhóm
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    zIndex: 1,
  },
  notificationText: {
    color: "white",
    fontSize: 12,
  },
  dropdown: {
    position: "absolute",
    top: 30,
    right: 0,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    width: 250,
    zIndex: 2,
  },
  notiItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  notiMessage: {
    fontSize: 14,
    color: "#333",
  },
  notiType: {
    fontSize: 12,
    color: "#888",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
});
