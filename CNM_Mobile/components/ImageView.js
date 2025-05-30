// import { useEffect, useState } from "react";
// import {
//   View,
//   Image,
//   TouchableOpacity,
//   Modal,
//   StyleSheet,
//   Text,
// } from "react-native";
// import { fetchUserDetail } from "../api/userDetailApi";
// import { useSelector } from "react-redux";
// import ImageViewer from "react-native-image-zoom-viewer";
// import * as MediaLibrary from "expo-media-library";
// import * as FileSystem from "expo-file-system";

// const ImageView = ({ message }) => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [userDetail, setUserDetail] = useState(null);
//   const accessToken = useSelector((state) => state.user.accessToken);

//   const downloadImage = async () => {
//     const { status } = await MediaLibrary.requestPermissionsAsync();
//     if (status !== "granted") {
//       alert("Cần cấp quyền truy cập thư viện");
//       return;
//     }

//     try {
//       const filename = message.image_url.split("/").pop();
//       const fileUri = FileSystem.documentDirectory + filename;

//       const downloadResult = await FileSystem.downloadAsync(
//         message.image_url,
//         fileUri,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       console.log("Downloaded file uri:", downloadResult.uri);

//       const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
//       console.log("File info:", fileInfo);

//       if (!fileInfo.exists || fileInfo.size === 0) {
//         alert("Tải ảnh thất bại, file rỗng hoặc không tồn tại");
//         return;
//       }

//       await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

//       alert("Đã lưu ảnh vào thư viện!");
//     } catch (error) {
//       console.error("Lỗi khi tải ảnh:", error);
//       alert("Tải ảnh thất bại!");
//     }
//   };

//   const getUserDetail = async () => {
//     const data = await fetchUserDetail(message.sender, accessToken);
//     if (data) {
//       console.log("user detail: ", data);
//       setUserDetail(data);
//     }
//   };

//   useEffect(() => {
//     getUserDetail();
//   }, [message]);

//   return (
//     <>
//       <TouchableOpacity onPress={() => setModalVisible(true)}>
//         <Image source={{ uri: message.image_url }} style={styles.thumbnail} />
//       </TouchableOpacity>

//       <Modal
//         visible={modalVisible}
//         transparent={true}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalBackground}>
//           {/* Vùng thông tin người dùng ở góc trên */}
//           {userDetail && (
//             <View style={styles.header}>
//               <View style={styles.userInfo}>
//                 <Image
//                   source={{ uri: userDetail.avatar_url }}
//                   style={styles.avatar}
//                 />
//                 <Text style={styles.fullname}>{userDetail.fullname}</Text>
//               </View>
//               <TouchableOpacity style={styles.btnDown} onPress={downloadImage}>
//                 <Text style={styles.fullname}>Tải xuống</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           <ImageViewer
//             imageUrls={[{ url: message.image_url }]}
//             enableSwipeDown
//             style={styles.fullImage}
//             onSwipeDown={() => setModalVisible(false)}
//             saveToLocalByLongPress={true}
//           />
//         </View>
//       </Modal>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   thumbnail: {
//     width: 80,
//     height: 80,
//     borderRadius: 20,
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//     width: "100%",
//   },
//   imageContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     width: "100%",
//   },
//   fullImage: {
//     width: "100%",
//     marginTop: 10,
//     maxHeight: "80%",
//   },
//   header: {
//     position: "absolute",
//     top: 20,
//     left: 20,
//     right: 20,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     zIndex: 999,
//   },
//   userInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 6,
//     borderRadius: 20,
//   },
//   avatar: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     marginRight: 8,
//   },
//   fullname: {
//     color: "white",
//     fontSize: 16,
//   },
//   btnDown: {
//     backgroundColor: "#444",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 10,
//   },
// });

// export default ImageView;

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Text,
  Alert,
} from "react-native";
import { fetchUserDetail } from "../api/userDetailApi";
import { useSelector } from "react-redux";
import ImageViewer from "react-native-image-zoom-viewer";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

const ImageView = ({ message }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const isMounted = useRef(true);
  const accessToken = useSelector((state) => state.user.accessToken);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Kiểm tra URL hình ảnh
  const validateUrl = useCallback((url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const imageUrl = validateUrl(message.image_url) ? message.image_url : null;

  // Tải và lưu hình ảnh
  const downloadImage = useCallback(async () => {
    try {
      if (!imageUrl) {
        Alert.alert("Lỗi", "URL hình ảnh không hợp lệ");
        return;
      }
      setDownloading(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Cần quyền",
          "Ứng dụng cần quyền truy cập thư viện để lưu hình ảnh"
        );
        setDownloading(false);
        return;
      }

      let processedUrl = imageUrl;
      if (imageUrl.includes(" ")) {
        processedUrl = encodeURI(imageUrl);
      }

      const downloadResult = await FileSystem.downloadAsync(
        processedUrl,
        FileSystem.documentDirectory +
          Date.now() +
          "_" +
          processedUrl.split("/").pop()
      );

      if (downloadResult.status === 200) {
        if (isMounted.current) {
          await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
          Alert.alert("Thành công", "Đã lưu ảnh vào thư viện!");
        }
      } else {
        throw new Error(`Tải thất bại với mã lỗi: ${downloadResult.status}`);
      }
    } catch (error) {
      if (isMounted.current) {
        Alert.alert("Lỗi", "Tải ảnh thất bại: " + error.message);
      }
    } finally {
      if (isMounted.current) {
        setDownloading(false);
      }
    }
  }, [imageUrl]);

  // Lấy thông tin người dùng
  const getUserDetail = useCallback(async () => {
    try {
      const data = await fetchUserDetail(message.sender, accessToken);
      if (data && isMounted.current) {
        setUserDetail(data);
      }
    } catch (error) {
      // Không cần alert, chỉ log
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  }, [message.sender, accessToken]);

  useEffect(() => {
    getUserDetail();
  }, [getUserDetail]);

  return (
    <>
      {/* Thumbnail view */}
      <TouchableOpacity
        onPress={() => imageUrl && setModalVisible(true)}
        style={styles.imageContainer}
      >
        {imageUrl ? (
          <Image
            source={{
              uri: imageUrl,
              cache: "default",
              headers: {
                // Một số headers cơ bản để đảm bảo tải được trên emulator
                Accept: "image/*",
                "Cache-Control": "max-age=0", // Tắt cache
              },
            }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.errorContainer]}>
            <Text style={styles.errorText}>Lỗi hình ảnh</Text>
          </View>
        )}

        {/* Download button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            downloadImage();
          }}
          style={styles.downloadButton}
          disabled={downloading || !imageUrl}
        >
          <Text style={styles.downloadText}>Lưu</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Full screen modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        animationType="fade"
      >
        <View style={styles.modalBackground}>
          {/* Header with user info */}
          {userDetail && (
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <Image
                  source={
                    userDetail.avatar_url
                      ? { uri: userDetail.avatar_url }
                      : require("../assets/default-avatar.png")
                  }
                  style={styles.avatar}
                />
                <Text style={styles.fullname}>{userDetail.fullname}</Text>
              </View>
              <TouchableOpacity
                style={styles.btnDown}
                onPress={downloadImage}
                disabled={downloading}
              >
                <Text style={styles.downloadButtonText}>Tải xuống</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeModalButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Image viewer */}
          {imageUrl ? (
            <ImageViewer
              imageUrls={[
                {
                  url: imageUrl,
                  props: {
                    source: {
                      uri: imageUrl,
                      cache: "reload",
                    },
                  },
                },
              ]}
              enableSwipeDown
              onSwipeDown={() => setModalVisible(false)}
              backgroundColor="transparent"
              onClick={() => setModalVisible(false)}
              renderIndicator={() => null}
              style={styles.imageViewer}
            />
          ) : (
            <View style={styles.errorModalContainer}>
              <Text style={styles.errorModalText}>Không thể tải hình ảnh</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 5,
  },
  thumbnail: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#d32f2f",
    fontWeight: "bold",
    textAlign: "center",
  },
  downloadButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,102,204,0.7)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  downloadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  fullname: {
    color: "white",
    fontWeight: "bold",
  },
  btnDown: {
    backgroundColor: "#0066cc",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  downloadButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeModalButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorModalText: {
    color: "white",
    fontSize: 18,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#0066cc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  imageViewer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ImageView;
