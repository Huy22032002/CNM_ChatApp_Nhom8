import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Button,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

export default function UserDetail({ route }) {
  const { userId, accessToken } = route.params;
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

  // Xin quyền truy cập thư viện ảnh
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền bị từ chối",
          "Ứng dụng cần quyền truy cập thư viện ảnh để đổi avatar."
        );
      }
    })();

    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://10.0.2.2:3000/api/userDetails/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error("Lỗi khi lấy thông tin người dùng");
      setUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    console.log("Clicked avatar"); // kiểm tra click

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      if (selectedAsset.uri === user.avatar_url) {
        Alert.alert("Thông báo", "Bạn đang chọn lại ảnh cũ!");
        return;
      }

      setSelectedAvatar(selectedAsset);
      setUser((prev) => ({ ...prev, avatar_url: selectedAsset.uri }));
    }
  };

  const handleSave = async () => {
    if (!user.fullname || isNaN(user.age)) {
      Alert.alert(
        "Lỗi",
        "Họ tên và tuổi không được để trống hoặc sai định dạng."
      );
      return;
    }

    const formData = new FormData();
    formData.append("fullname", user.fullname);
    formData.append("age", user.age.toString());
    formData.append("gender", user.gender ? "1" : "0");

    if (selectedAvatar) {
      formData.append("avatar", {
        uri: selectedAvatar.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });
    }

    try {
      setSaving(true);

      const response = await fetch(
        `http://10.0.2.2:3000/api/userDetails/update/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        throw new Error("Phản hồi không hợp lệ từ máy chủ.");
      }

      if (!response.ok)
        throw new Error(result.message || "Lỗi khi cập nhật thông tin");

      Alert.alert("Cập nhật thành công!");
      setEditing(false);
      setSelectedAvatar(null);
      await fetchUser();
    } catch (err) {
      console.error("Update user error:", err);
      Alert.alert("Lỗi", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Không thể tải thông tin người dùng.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Nút quay lại HomeChat */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("homeChat", {
            userId: userId,
            accessToken: accessToken,
          })
        }
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Quay lại</Text>
      </TouchableOpacity>

      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              user.avatar_url
                ? { uri: user.avatar_url }
                : require("../assets/default-avatar.png")
            }
            style={styles.avatar}
          />
          <Text style={styles.changePhotoText}>Đổi ảnh đại diện</Text>
        </TouchableOpacity>
      </View>

      {editing ? (
        <>
          <TextInput
            style={styles.input}
            value={user.fullname}
            onChangeText={(text) => setUser({ ...user, fullname: text })}
            placeholder="Họ tên"
          />
          <TextInput
            style={styles.input}
            value={user.age?.toString()}
            onChangeText={(text) =>
              setUser({ ...user, age: parseInt(text) || 0 })
            }
            keyboardType="numeric"
            placeholder="Tuổi"
          />

          {/* Giới tính radio */}
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUser({ ...user, gender: true })}
            >
              <View style={styles.radioCircle}>
                {user.gender === true && <View style={styles.selectedDot} />}
              </View>
              <Text style={styles.radioText}>Nam</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUser({ ...user, gender: false })}
            >
              <View style={styles.radioCircle}>
                {user.gender === false && <View style={styles.selectedDot} />}
              </View>
              <Text style={styles.radioText}>Nữ</Text>
            </TouchableOpacity>
          </View>

          <Button
            title={saving ? "Đang lưu..." : "Lưu thông tin"}
            onPress={handleSave}
            disabled={saving}
          />
        </>
      ) : (
        <>
          <Text style={styles.name}>{user.fullname}</Text>
          <Text style={styles.detail}>Tuổi: {user.age}</Text>
          <Text style={styles.detail}>
            Giới tính: {user.gender ? "Nam" : "Nữ"}
          </Text>
          <Button title="Chỉnh sửa" onPress={() => setEditing(true)} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backText: {
    fontSize: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ccc",
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginVertical: 4,
  },
  changePhotoText: {
    fontSize: 14,
    color: "#007bff",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 12,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  selectedDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#007bff",
  },
  radioText: {
    fontSize: 16,
  },
});
