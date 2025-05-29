import { useEffect, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Text,
} from "react-native";
import { fetchUserDetail } from "../api/userDetailApi";
import { useSelector } from "react-redux";
import ImageViewer from "react-native-image-zoom-viewer";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

const ImageView = ({ message }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const accessToken = useSelector((state) => state.user.accessToken);

  const downloadImage = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Cần cấp quyền truy cập thư viện");
      return;
    }

    try {
      const filename = message.image_url.split("/").pop();
      const fileUri = FileSystem.documentDirectory + filename;

      const downloadResult = await FileSystem.downloadAsync(
        message.image_url,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Downloaded file uri:", downloadResult.uri);

      const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
      console.log("File info:", fileInfo);

      if (!fileInfo.exists || fileInfo.size === 0) {
        alert("Tải ảnh thất bại, file rỗng hoặc không tồn tại");
        return;
      }

      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

      alert("Đã lưu ảnh vào thư viện!");
    } catch (error) {
      console.error("Lỗi khi tải ảnh:", error);
      alert("Tải ảnh thất bại!");
    }
  };

  const getUserDetail = async () => {
    const data = await fetchUserDetail(message.sender, accessToken);
    if (data) {
      console.log("user detail: ", data);
      setUserDetail(data);
    }
  };

  useEffect(() => {
    getUserDetail();
  }, [message]);

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image source={{ uri: message.image_url }} style={styles.thumbnail} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          {/* Vùng thông tin người dùng ở góc trên */}
          {userDetail && (
            <View style={styles.userInfo}>
              <Image
                source={{ uri: userDetail.avatar_url }}
                style={styles.avatar}
              />
              <Text style={styles.fullname}>{userDetail.fullname}</Text>
              <TouchableOpacity style={styles.btnDown} onPress={downloadImage}>
                <Text style={styles.fullname}>Tai xuog</Text>
              </TouchableOpacity>
            </View>
          )}

          <ImageViewer
            imageUrls={[{ url: message.image_url }]}
            enableSwipeDown
            style={styles.fullImage}
            onSwipeDown={() => setModalVisible(false)}
            saveToLocalByLongPress={true}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  fullImage: {
    width: "100%",
    marginTop: 10,
  },
  userInfo: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 20,
    zIndex: 999,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  fullname: {
    color: "white",
    fontSize: 16,
  },
  btnDown: {},
});

export default ImageView;
