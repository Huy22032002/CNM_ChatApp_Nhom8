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

import { fetchUserDetail } from "../api/userDetailApi";
import ConversationApi from "../api/conversationApi";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from '@react-navigation/native';
import { API_URL } from "../api/apiConfig";


export default function HomeChat({ navigation }) {
  navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [userInfo, setUserInfo] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [conversationDetails, setConversationDetails] = useState([]);


  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendRequestsDetails, setFriendRequestsDetails] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications/${user.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setNotifications(res.data); // [{ message, type, status }]
    } catch (err) {
      console.error("Lỗi khi lấy thông báo:", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications/unread-count/${user.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      // console.log("res unread count:", res.data.count);
      setUnreadCount(res.data.count); // [{ message, type, status }]
    } catch (err) {
      console.error("Lỗi khi lấy thông báo:", err);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/api/notifications/mark-read/${user.id}`, {}, {
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
      const res = await axios.get(`${API_URL}/api/friends/requests/${user.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFriendRequests(res.data); // [{ message, type, status }]
      // console.log("Lời mời kết bạn:", friendRequests);
      
      // Fetch details for each friend request
      const detailsPromises = res.data.map(async (request) => {
        const userDetail = await fetchUserDetail(request.friend_id, accessToken);
        return {
          ...request,
          userDetail
        };
      });
      
      const details = await Promise.all(detailsPromises);
      // console.log("Chi tiết lời mời kết bạn:", details);
      setFriendRequestsDetails(details);
    } catch (err) {
      console.error("Lỗi khi lấy lời mời kết bạn:", err);
    }
  };

  const acceptFriendRequest = async (friend_id) => {
    try {
      await axios.post(`${API_URL}/api/friends/accept`, 
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
      fetchFriendRequests(); // Refresh the friend requests after accepting one
      getListConversation(); // Refresh the conversations after accepting a friend request
    } catch (err) {
      console.error("Lỗi khi chấp nhận kết bạn", err);
    }
  };

  const cancelFriendRequest = async (friend_id) => {
    try {
      await axios.post(`${API_URL}/api/friends/cancel-request`, 
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
      fetchFriendRequests(); // Refresh the friend requests after accepting one
      getListConversation(); 
    } catch (err) {
      console.error("Lỗi khi từ chối kết bạn", err);
    }
  };
  
  const filteredData = conversationDetails.filter((item) =>
    (item.otherUserDetail?.fullname || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
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

  const getUserDetail = async () => {
    try {
      const data = await fetchUserDetail(user.id, accessToken);
      if (data.error) {
        Alert.alert("Lỗi", data.error);
        setUserDetail(null);
        logout();
        return;
      }
      // console.log("data fetch userdetail:", data);
      setUserDetail(data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      // Alert.alert("Lỗi", "Không thể lấy thông tin người dùng");
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      // Xóa thông tin người dùng và token trong Redux
      justLogout();
      // logout();
    }
  };

  const justLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/auth/logout`,
        {
          id: userInfo?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // Alert.alert("Thành công", "Đã đăng xuất thành công");
      navigation.navigate("login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error.message);
      Alert.alert("Lỗi", "Không thể đăng xuất");
    }
  };
  
  const getListConversation = async () => {
    const data = await ConversationApi.fetchConversationsByUserId(
      user.id,
      accessToken
    );
    if (data) {
      setConversations(data);
  
      // Lấy user detail của người còn lại trong participants (trừ user hiện tại)
      const detailsPromises = data.map(async (conv) => {
        // Giả sử conv.participants là mảng các userId
        const otherUserId = Array.isArray(conv.participants)
          ? conv.participants.find((id) => id !== user.id)
          : null;
        let otherUserDetail = null;
        if (otherUserId) {
          otherUserDetail = await fetchUserDetail(otherUserId, accessToken);
        }
        return {
          ...conv,
          otherUserDetail,
        };
      });
  
      const details = await Promise.all(detailsPromises);
      // console.log("Chi tiết cuộc trò chuyện:", details);
      setConversationDetails(details);
    }
  };
//   const getUserDetail = async () => {
//     const data = await fetchUserDetail(user.id, accessToken);
//     console.log("data fetch userdetail:", data);
//     setUserDetail(data);
//   };
  
  useEffect(() => {
    setUserInfo(user);
    getUserDetail();
    getListConversation();
    fetchNotifications();
    fetchUnreadCount();
    fetchFriendRequests();
    
  }, [user]);

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
          `${API_URL}/api/users/checkMatchPassword`,
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
        `${API_URL}/api/users/updatePassword/`,
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
        `${API_URL}/auth/logout`,
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
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {
        navigation.navigate("chatScreen", {
          conversation_id: item.conversation_id,
          otherUserDetail: item.otherUserDetail,
        });
      }}
    >
      <Image
        source={
          item.otherUserDetail?.avatar_url
            ? { uri: item.otherUserDetail.avatar_url }
            : require("../assets/user1.png")
        }
        style={styles.avatar}
      />
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>
          {item.otherUserDetail?.fullname || item.conversation_id}
        </Text>
        <Text style={styles.chatMsg}>
          {item.lastMessage?.content || "Chưa có tin nhắn"}
        </Text>
        <Text>
          {item.lastMessage?.updated_at
            ? item.lastMessage.updated_at
            : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
      </View>
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
              <Text style={styles.header}>Thông báo</Text>
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
            {friendRequests.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{friendRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {showFriendRequests && (
            <View style={styles.dropdown}>
              <Text style={styles.header}>Lời mời kết bạn</Text>
              <ScrollView style={{ maxHeight: 200 }}>
                {friendRequestsDetails.length === 0 ? (
                  <Text style={styles.emptyText}>Không có lời mời kết bạn</Text>
                ) : (
                  friendRequestsDetails.map((request, index) => (
                    <View key={index} style={styles.requestCard}>
                      <Image
                        source={request.userDetail?.avatar_url ? { uri: request.userDetail.avatar_url } : require("../assets/default-avatar.png")}
                        style={styles.requestAvatar}
                      />
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestName}>{request.userDetail?.fullname || request.name}</Text>
                        <View style={styles.requestActions}>
                          <TouchableOpacity
                            style={[styles.requestButton, styles.requestAcceptButton]}
                            onPress={() => acceptFriendRequest(request.friend_id)}
                          >
                            <Text style={styles.requestButtonText}>Chấp nhận</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.requestButton, styles.requestDeclineButton]}
                            onPress={() => cancelFriendRequest(request.friend_id)}
                          >
                            <Text style={styles.requestButtonText}>Từ chối</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
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
      <FlatList
        data={searchQuery ? filteredData : conversationDetails}
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
    width: 300,
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
  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  requestAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  
  requestInfo: {
    flex: 1,
  },
  
  requestName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  
  requestActions: {
    flexDirection: "row",
    gap: 10,
  },
  
  requestButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  
  requestAcceptButton: {
    backgroundColor: "#4CAF50",
    
  },
  
  requestDeclineButton: {
    backgroundColor: "#f44336",
  },
  
  requestButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  
});
