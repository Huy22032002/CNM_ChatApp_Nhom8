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
} from "react-native";
import axios from "axios";

const FindUserScreen = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user.user);
  const accessToken = useSelector((state) => state.user.accessToken);
  const API_URL = "http://10.0.2.2:3000";


  const searchUser = async () => {
    if (!keyword.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập email hoặc số điện thoại.");
      return;
    }
  
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/user/search`,
        {
          keyword: keyword,  
          id: user.id,        
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, 
          },
        }
      );
  
      setResults(response.data);
    } catch (error) {
      console.error("Lỗi tìm người dùng:", error);
      Alert.alert("Lỗi", "Không thể tìm kiếm người dùng.");
    } finally {
      setLoading(false);
    }
  };
  

  const sendFriendRequest = async (friendId) => {
    try {
      await axios.post(`${API_URL}/api/friend/add`, {
        receiverId: friendId,
      });
      Alert.alert("Thành công", "Đã gửi lời mời kết bạn.");
    } catch (error) {
      console.error("Lỗi gửi lời mời:", error);
      Alert.alert("Lỗi", "Không thể gửi lời mời kết bạn.");
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <Text style={styles.userText}>{item.name} ({item.email || item.phone})</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => sendFriendRequest(item.id)}
      >
        <Text style={styles.addButtonText}>Kết bạn</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
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
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.noResult}>Không tìm thấy người dùng nào.</Text>}
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
    justifyContent: "space-between",
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
