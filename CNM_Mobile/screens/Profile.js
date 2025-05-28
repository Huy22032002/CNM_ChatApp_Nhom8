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
import { useSelector } from "react-redux";

import { fetchUserDetail, updateUserDetail } from "../api/userDetailApi";

export default function UserDetail() {
  const navigation = useNavigation();

  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

  //lay user va accessToken tu redux
  const userRedux = useSelector((state) => state.user.user);
  const accessToken = useSelector((state) => state.user.accessToken);

  // Xin quyền truy cập thư viện ảnh
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền bị từ chối", "Ứng dụng cần quyền truy cập ảnh.");
      }
    })();

    getUserDetail();
  }, []);

  const getUserDetail = async () => {
    try {
      setLoading(true);
      const data = await fetchUserDetail(userRedux.id, accessToken);
      if (!data) throw new Error("Lỗi khi lấy thông tin người dùng");
      setUserDetail(data);
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
      if (selectedAsset.uri === userDetail.avatar_url) {
        Alert.alert("Thông báo", "Bạn đang chọn lại ảnh cũ!");
        return;
      }

      setSelectedAvatar(selectedAsset);
      setUserDetail((prev) => ({ ...prev, avatar_url: selectedAsset.uri }));
    }
  };

  const handleSave = async () => {
    if (!userDetail.fullname || isNaN(userDetail.age)) {
      Alert.alert(
        "Lỗi",
        "Họ tên và tuổi không được để trống hoặc sai định dạng."
      );
      return;
    }

    const formData = new FormData();
    formData.append("fullname", userDetail.fullname);
    formData.append("age", userDetail.age.toString());
    formData.append("gender", userDetail.gender ? "1" : "0");

    if (selectedAvatar) {
      formData.append("avatar", {
        uri: selectedAvatar.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });
    }

    try {
      setSaving(true);

      const data = await updateUserDetail(userRedux.id, accessToken, formData);
      if (data != null) {
        Alert.alert("Cập nhật thành công!");
        setEditing(false);
        setSelectedAvatar(null);
        await getUserDetail();
      }
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

  if (!userDetail) {
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
        onPress={() => navigation.navigate("homeChat")}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Quay lại</Text>
      </TouchableOpacity>

      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              userDetail.avatar_url
                ? { uri: userDetail.avatar_url }
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
            value={userDetail.fullname}
            onChangeText={(text) =>
              setUserDetail({ ...userDetail, fullname: text })
            }
            placeholder="Họ tên"
          />
          <TextInput
            style={styles.input}
            value={userDetail.age?.toString()}
            onChangeText={(text) =>
              setUserDetail({ ...userDetail, age: parseInt(text) || 0 })
            }
            keyboardType="numeric"
            placeholder="Tuổi"
          />

          {/* Giới tính radio */}
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserDetail({ ...userDetail, gender: true })}
            >
              <View style={styles.radioCircle}>
                {userDetail.gender === true && (
                  <View style={styles.selectedDot} />
                )}
              </View>
              <Text style={styles.radioText}>Nam</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserDetail({ ...userDetail, gender: false })}
            >
              <View style={styles.radioCircle}>
                {userDetail.gender === false && (
                  <View style={styles.selectedDot} />
                )}
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
          <Text style={styles.name}>{userDetail.fullname}</Text>
          <Text style={styles.detail}>Tuổi: {userDetail.age}</Text>
          <Text style={styles.detail}>
            Giới tính: {userDetail.gender ? "Nam" : "Nữ"}
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
