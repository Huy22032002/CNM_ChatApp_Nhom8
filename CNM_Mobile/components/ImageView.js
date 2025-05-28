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

const ImageView = ({ message }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const accessToken = useSelector((state) => state.user.accessToken);

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
            </View>
          )}

          {/* Nhấn để đóng modal và xem ảnh */}
          <TouchableOpacity
            style={styles.imageContainer}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <Image
              source={{ uri: message.image_url }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
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
    width: 300,
    height: 400,
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
});

export default ImageView;
