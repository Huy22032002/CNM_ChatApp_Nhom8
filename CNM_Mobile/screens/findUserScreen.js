import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../api/apiConfig";
import ConversationApi from "../api/conversationApi";

const FindUserScreen = () => {
  const navigation = useNavigation();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const user = useSelector((state) => state.user.user);
  const accessToken = useSelector((state) => state.user.accessToken);

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/friends/${user.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      // Tách friend_id thành mảng mới
      const friendIds = response.data.map(item => item.friend_id);
      console.log("Danh sách friend_id:", friendIds);
      setFriends(friendIds);
    } catch (error) {
      console.error("Lỗi lấy danh sách bạn bè:", error);
      Alert.alert("Lỗi", "Không thể lấy danh sách bạn bè.");
    }
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchFriends();
    });
    return unsubscribe;
  }, [navigation]);


  const searchUser = async () => {
    if (!keyword.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập email hoặc số điện thoại.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/users/search`,
        {
          keyword: keyword,
          id: Number(user.id),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { users, userDetails } = response.data;

      const combinedResults = users.map((u) => {
        const detail = userDetails.find((d) => d.user_id === u.id) || {};
        return { user: u, userDetails: detail };
      });

      setResults(combinedResults);
    } catch (error) {
      console.error("Lỗi tìm người dùng:", error);
      Alert.alert("Lỗi", "Không thể tìm kiếm người dùng.");
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId) => {
    try {
      console.log("Gửi lời mời kết bạn cho ID:", friendId);
      const res= await axios.post(`${API_URL}/api/friends/add`, 
      {
        user_id: user.id,
        friend_id: friendId,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        }
      });
      Alert.alert("Thành công", "Đã gửi lời mời kết bạn.");
      
    } catch (error) {
      console.error("Lỗi gửi lời mời:", error);
      Alert.alert("Lỗi", "Không thể gửi lời mời kết bạn.");
    }
  };

  const handleChatPress = async (otherUserId, otherUserDetail) => {
    try {
      // Lấy tất cả các cuộc trò chuyện của user hiện tại
      const conversations = await ConversationApi.fetchConversationsByUserId(user.id, accessToken);
      // Tìm cuộc trò chuyện với user cần nhắn tin
      const conversation = conversations.find(conv =>
        Array.isArray(conv.participants) &&
        conv.participants.includes(otherUserId)
      );
      if (conversation) {
        navigation.navigate("chatScreen", {
          conversation_id: conversation.conversation_id,
          otherUserDetail: otherUserDetail,
        });
      } else {
        Alert.alert("Thông báo", "Chưa có cuộc trò chuyện với người này.");
        // Hoặc có thể tạo mới conversation ở đây nếu muốn
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy thông tin cuộc trò chuyện.");
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <Image
        source={{
          uri: item.userDetails.avatar_url || "https://via.placeholder.com/150",
        }}
        style={{ width: 50, height: 50, borderRadius: 25 }}
      />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.userText}>
          {item.userDetails.fullname || "Không tên"} ({item.user.email || item.user.phone})
        </Text>
      </View>
      {friends.includes(item.user.id) ? (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: "#4CAF50" }]}
          onPress={() => handleChatPress(item.user.id, item.userDetails)}
        >
          <Text style={styles.addButtonText}>Nhắn tin</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => sendFriendRequest(item.user.id)}
        >
          <Text style={styles.addButtonText}>Kết bạn</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const backToHomeChat = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={backToHomeChat}>
        <Image
          source={require("../assets/back.png")}
          style={{ width: 24, height: 24,marginTop:20 }}
        />
      </TouchableOpacity>
      <Text style={styles.title}>Tìm kiếm người dùng</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập email hoặc số điện thoại"
        value={keyword}
        onChangeText={setKeyword}
      />
      <Button title="Tìm kiếm" onPress={searchUser} disabled={loading} />
      <FlatList
        data={results}
        keyExtractor={(item) => item.user.id.toString()}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.noResult}>Không tìm thấy người dùng nào.</Text>
        }
      />
    </View>
  );
};

export default FindUserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  userText: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContainer: {
    marginTop: 16,
  },
  noResult: {
    marginTop: 20,
    textAlign: "center",
    color: "#888",
  },
});
