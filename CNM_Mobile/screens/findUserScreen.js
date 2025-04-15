import React, { useState } from "react";
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

const FindUserScreen = () => {
  const navigation = useNavigation();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user.user);
  const accessToken = useSelector((state) => state.user.accessToken);

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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => sendFriendRequest(item.user.id)}
      >
        <Text style={styles.addButtonText}>Kết bạn</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Nút quay lại HomeChat */}
            <TouchableOpacity
              onPress={() => navigation.navigate("homeChat")}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Quay lại</Text>
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
