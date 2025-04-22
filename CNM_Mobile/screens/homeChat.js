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
import { useNavigation } from "@react-navigation/native";
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
  const [chatTab, setChatTab] = useState("ALL"); // "ALL" | "SINGLE" | "GROUP"

  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendRequestsDetails, setFriendRequestsDetails] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [friendsList, setFriendsList] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const user = useSelector((state) => state.user.user);
  const accessToken = useSelector((state) => state.user.accessToken);

  const fetchFriendsList = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/friends/${user.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      //lọc ra friend_id rồi gọi api lấy thông tin bạn bè
      const friendIds = res.data.map((friend) => friend.friend_id);
      const friendDetailsPromises = friendIds.map((friendId) =>
        fetchUserDetail(friendId, accessToken)
      );
      const friendDetails = await Promise.all(friendDetailsPromises);
      //Kết hợp thông tin bạn bè với danh sách bạn bè
      const friendsWithDetails = res.data.map((friend, index) => ({
        ...friend,
        ...friendDetails[index],
      }));
      console.log("Danh sách bạn bè với chi tiết:", friendsWithDetails);
      //Lưu danh sách bạn bè vào state
      setFriendsList(friendsWithDetails);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bạn bè:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications/${user.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy thông báo:", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/notifications/unread-count/${user.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Lỗi khi lấy số thông báo chưa đọc:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${API_URL}/api/notifications/mark-read/${user.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
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
      const res = await axios.get(
        `${API_URL}/api/friends/requests/${user.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setFriendRequests(res.data);

      // Fetch details for each friend request
      const detailsPromises = res.data.map(async (request) => {
        const userDetail = await fetchUserDetail(
          request.friend_id,
          accessToken
        );
        return {
          ...request,
          userDetail,
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
      await axios.post(
        `${API_URL}/api/friends/accept`,
        {
          user_id: user.id,
          friend_id,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      handleFriendPress();
      fetchFriendRequests();
      getListConversation();
    } catch (err) {
      console.error("Lỗi khi chấp nhận kết bạn", err);
    }
  };

  const cancelFriendRequest = async (friend_id) => {
    try {
      await axios.post(
        `${API_URL}/api/friends/cancel-request`,
        {
          user_id: user.id,
          friend_id,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      handleFriendPress();
      fetchFriendRequests();
      getListConversation();
    } catch (err) {
      console.error("Lỗi khi từ chối kết bạn", err);
    }
  };

  // Cập nhật logic lấy danh sách cuộc trò chuyện để xử lý cả chat đơn và nhóm
  const getListConversation = async () => {
    const data = await ConversationApi.fetchConversationsByUserId(
      user.id,
      accessToken
    );
    // console.log("Dữ liệu cuộc trò chuyện:", data);
    if (data) {
      setConversations(data);

      // Xử lý dữ liệu chi tiết cho từng loại cuộc trò chuyện
      const detailsPromises = data.map(async (conv) => {
        if (conv.type === "SINGLE") {
          // Xử lý chat đơn: lấy thông tin của người dùng còn lại
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
        } else if (conv.type === "GROUP") {
          // Xử lý chat nhóm: lấy thông tin tất cả thành viên trừ user hiện tại
          const otherUsers = Array.isArray(conv.participants)
            ? conv.participants.filter((id) => id !== user.id)
            : [];
          const otherUserDetails = await Promise.all(
            otherUsers.map((id) => fetchUserDetail(id, accessToken))
          );
          return {
            ...conv,
            otherUserDetails,
          };
        }
        return conv;
      });

      const details = await Promise.all(detailsPromises);
      setConversationDetails(details);
    }
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm và tab được chọn
  const filteredData = conversationDetails.filter((item) => {
    // Lọc theo tab đã chọn
    if (chatTab !== "ALL" && item.type !== chatTab) {
      return false;
    }

    // Lọc theo từ khóa tìm kiếm
    if (item.type === "SINGLE") {
      return (item.otherUserDetail?.fullname || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    } else if (item.type === "GROUP") {
      // Tìm trong danh sách thành viên nhóm
      return (
        item.GROUP_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.otherUserDetails?.some((user) =>
          (user.fullname || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        ) ||
        false
      );
    }
    return false;
  });

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
      setUserDetail(data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      justLogout();
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
      navigation.navigate("login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error.message);
      Alert.alert("Lỗi", "Không thể đăng xuất");
    }
  };

  useEffect(() => {
    setUserInfo(user);
    getUserDetail();
    getListConversation();
    fetchNotifications();
    fetchUnreadCount();
    fetchFriendRequests();
    fetchFriendsList();
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

  const handleCreateGroup = async () => {
    if (selectedFriends.length <2 ) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất hai người !");
      return;
    }
    if (!groupName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhóm !");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/conversations/add_group`,
        {
          type: "GROUP",
          group_name: groupName,
          //participants: selectedFriends +user
          participants: [user.id, ...selectedFriends],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 200) {
        Alert.alert("Thành công", "Tạo nhóm thành công");
      }
      setShowCreateGroup(false);
      setGroupName("");
      setSelectedFriends([]);
      getListConversation();
    } catch (error) {
      console.error("Lỗi khi tạo nhóm chat:", error.message);
    }
  };

  const toggleSelectFriend = (friendId) => {
    setSelectedFriends((prevSelectedFriends) => {
      const updatedSelectedFriends = prevSelectedFriends.includes(friendId)
        ? prevSelectedFriends.filter((id) => id !== friendId)
        : [...prevSelectedFriends, friendId];
      console.log("Updated selectedFriends:", updatedSelectedFriends);
      return updatedSelectedFriends;
    });
  };
  // Cập nhật render item để hiển thị đúng với loại chat
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {
        if (item.type === "SINGLE") {
          navigation.navigate("chatScreen", {
            conversation_id: item.conversation_id,
            otherUserDetail: item.otherUserDetail,
            type: item.type,
          });
        } else if (item.type === "GROUP") {
          navigation.navigate("chatGroupScreen", {
            conversation_id: item.conversation_id,
            groupName: item.group_name,
            participants: item.otherUserDetails,
            type: item.type,
          });
        }
      }}
    >
      <Image
        source={
          item.type === "SINGLE"
            ? item.otherUserDetail?.avatar_url
              ? { uri: item.otherUserDetail.avatar_url }
              : require("../assets/user1.png")
            : item.group_avatar
              ? { uri: item.group_avatar }
              : {uri:item.otherUserDetails[0].avatar_url}
        }
        style={styles.avatar}
      />
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>
          {item.type === "SINGLE"
            ? item.otherUserDetail?.fullname || "Người dùng ID: "+item.otherUserDetail?.user_id
            : "[Nhóm] "+item.group_name ||
              item.otherUserDetails?.map((u) => u.fullname).join(", ") ||
              "Nhóm chat"}
        </Text>
        <Text style={styles.chatMsg} numberOfLines={1} ellipsizeMode="tail">
          {item.lastMessage?.content || "Chưa có tin nhắn"}
        </Text>
        <Text style={styles.chatTime}>
          {item.lastMessage?.updated_at || ""}
        </Text>
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
              <Text style={styles.notificationText}>
                {friendRequests.length}
              </Text>
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
                      source={
                        request.userDetail?.avatar_url
                          ? { uri: request.userDetail.avatar_url }
                          : require("../assets/default-avatar.png")
                      }
                      style={styles.requestAvatar}
                    />
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>
                        {request.userDetail?.fullname || request.name}
                      </Text>
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={[
                            styles.requestButton,
                            styles.requestAcceptButton,
                          ]}
                          onPress={() => acceptFriendRequest(request.friend_id)}
                        >
                          <Text style={styles.requestButtonText}>
                            Chấp nhận
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.requestButton,
                            styles.requestDeclineButton,
                          ]}
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

      {/* Create Group Chat Modal */}
      <Modal
        visible={showCreateGroup}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateGroup(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.createGroupModal}>
            <Text style={styles.modalHeader}>Tạo nhóm chat</Text>

            {/* Group Name Input */}
            <TextInput
              placeholder="Nhập tên nhóm"
              value={groupName}
              onChangeText={setGroupName}
              style={styles.groupNameInput}
            />

            {/* Friend Search */}
            <TextInput
              placeholder="Tìm bạn bè"
              value={friendSearchQuery}
              onChangeText={setFriendSearchQuery}
              style={styles.friendSearchInput}
            />

            {/* Friends List */}
            <Text style={styles.friendsListHeader}>Danh sách bạn bè</Text>
            <FlatList
              data={friendsList.filter((friend) =>
                friend.fullname||"Người dùng ID: "+friend.user_id+""
                  .toLowerCase()
                  .includes(friendSearchQuery.toLowerCase())
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.friendItem,
                    selectedFriends.includes(item.friend_id) &&
                      styles.selectedFriendItem,
                  ]}
                  onPress={() => toggleSelectFriend(item.friend_id)}
                >
                  <Image
                    source={
                      item.avatar_url
                        ? { uri: item.avatar_url }
                        : require("../assets/default-avatar.png")
                    }
                    style={styles.friendAvatar}
                  />
                  <Text style={styles.friendName}>{item.fullname}</Text>
                  {selectedFriends.includes(item.friend_id) && (
                    <Icon
                      name="check-circle"
                      size={24}
                      color="#0066cc"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) =>
                item.friend_id ? item.friend_id.toString() : index.toString()
              }
              style={styles.friendsList}
              ListEmptyComponent={() => (
                <Text style={styles.emptyText}>Không tìm thấy bạn bè</Text>
              )}
            />

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateGroup(false)}
              >
                <Text style={styles.cancelButtonText}>Huỷ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  (selectedFriends.length === 0 || !groupName.trim()) &&
                    styles.disabledButton,
                ]}
                onPress={handleCreateGroup}
                disabled={selectedFriends.length === 0 || !groupName.trim()}
              >
                <Text style={styles.createButtonText}>Tạo nhóm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.createGroupButton}
          onPress={() => setShowCreateGroup(true)}
        >
          <Icon name="users" size={24} color="#333" />
          <Text style={styles.createGroupText}>Tạo nhóm chat</Text>
        </TouchableOpacity>
      </View>

      {/* Tab buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, chatTab === "ALL" && styles.activeTab]}
          onPress={() => setChatTab("ALL")}
        >
          <Text
            style={[styles.tabText, chatTab === "ALL" && styles.activeTabText]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, chatTab === "SINGLE" && styles.activeTab]}
          onPress={() => setChatTab("SINGLE")}
        >
          <Text
            style={[
              styles.tabText,
              chatTab === "SINGLE" && styles.activeTabText,
            ]}
          >
            Chat Đơn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, chatTab === "GROUP" && styles.activeTab]}
          onPress={() => setChatTab("GROUP")}
        >
          <Text
            style={[
              styles.tabText,
              chatTab === "GROUP" && styles.activeTabText,
            ]}
          >
            Chat Nhóm
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.conversation_id.toString()}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>
            {searchQuery
              ? "Không tìm thấy kết quả phù hợp"
              : "Chưa có cuộc trò chuyện nào"}
          </Text>
        )}
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
  chatTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
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
    marginTop: 20,
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
  createGroupButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f7ff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0066cc",
  },
  createGroupText: {
    color: "#0066cc",
    marginLeft: 8,
    fontWeight: "500",
  },
  createGroupModal: {
    backgroundColor: "white",
    marginHorizontal: 20,
    padding: 20,
    marginTop: "40%",
    borderRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  groupNameInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  friendSearchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  friendsListHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  friendsList: {
    maxHeight: 200,
    marginBottom: 12,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  selectedFriendItem: {
    backgroundColor: "#e6f7ff",
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  friendName: {
    fontSize: 16,
    flex: 1,
  },
  checkIcon: {
    marginLeft: "auto",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cancelButton: {
    backgroundColor: "#f44336",
    // backgroundColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  createButton: {
    //xanh dương
    backgroundColor: "#4CAF50",
    // backgroundColor: "#0066cc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});
