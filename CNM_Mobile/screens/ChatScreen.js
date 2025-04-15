import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Linking,
} from "react-native";
import MessageAPI from "../api/messageApi";
import ConversationApi from "../api/conversationApi";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

const ChatScreen = ({ route }) => {
  const { conversation_id } = route.params;

  //lay user tu redux
  const user = useSelector((state) => state.user.user);
  const accessToken = useSelector((state) => state.user.accessToken);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState(null);
  //state xu ly cac su kien message
  const [selectMessage, setSelectMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  //state cập nhật tin nhắn
  const [edit, setEdit] = useState(false);
  const [editContent, setEditContent] = useState("");
  const openEditContent = () => {
    setEdit(true);
  };

  //state cho hinh anh, document
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  //state cho emoji
  const [showEmojiPopUp, setShowEmojiPopUp] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const selectEmoji = () => {
    setShowEmojiPopUp(true);
  };

  const selectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const selectedImg = result.assets[0];
      setSelectedImage(selectedImg);
    }
  };
  const selectDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log("Document: ", file);
        setSelectedDocument(file);
      }
    } catch (err) {
      console.log("err select document: ", err);
    }
  };

  const navigation = useNavigation();

  const fetchMessages = async () => {
    const data = await MessageAPI.fetchMessages(conversation_id, accessToken);
    setMessages(data);
  };
  const fetchConversation = async () => {
    try {
      const data = await ConversationApi.fetchConversationsByConverId(
        conversation_id,
        accessToken
      );
      setConversation(data);
    } catch (error) {
      console.error("Error fetching conversation: ", error);
    }
  };

  //message function
  const handleSend = async () => {
    if (!selectedImage && !newMessage && !selectedDocument) {
      alert("Vui lòng nhập nội dung gui");
      return;
    }
    if (selectedDocument) {
      console.log("Gui pdf");
      await sendImageAndText();
      setNewMessage("");
      setSelectedDocument(null);
      return;
    }
    if (selectedImage) {
      console.log("Gui ca text va image");
      await sendImageAndText();
      setNewMessage("");
      setSelectedImage(null);
      return;
    }
    if (newMessage) {
      console.log("chi gui text");
      await sendMessage();
      setNewMessage("");
      return;
    }
  };
  const sendMessage = async () => {
    if (newMessage == "" || newMessage == null) {
      alert("vui lòng nhập nội dung để gửi");
      return;
    }
    const receivers = conversation.participants
      .filter((participant) => participant != user.id)
      .map(Number);
    console.log("receivers: ", receivers);

    const data = {
      conversation_id: conversation_id,
      sender: user.id,
      receivers: receivers,
      content: newMessage,
      type: "TEXT",
    };
    try {
      const newMessage = await MessageAPI.sendMessage(data, accessToken);
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error("Send message failed: ", err.message);
    }
  };
  const sendImageAndText = async () => {
    const receivers = conversation.participants.filter(
      (participant) => participant != user.id
    );

    const formData = new FormData();
    formData.append("conversation_id", conversation_id);
    formData.append("sender", user.id);
    receivers.forEach((id) => {
      formData.append("receivers[]", id);
    });
    if (newMessage) {
      formData.append("content", newMessage);
    }
    if (selectedImage) {
      formData.append("image", {
        uri: selectedImage.uri,
        name: "image.jpg",
        type: "image/jpeg",
      });
    } else if (selectedDocument) {
      formData.append("image", {
        uri: selectedDocument.uri,
        name: selectedDocument.name || "document.pdf",
        type: selectedDocument.mimeType || "application/pdf",
      });
    }
    try {
      const response = await MessageAPI.sendImageAndText(formData, accessToken);
      fetchMessages();
      return response;
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  const handleMessage = (message_id) => {
    console.log("select message id: ", message_id);
    setSelectMessage(message_id);
    setShowMessageModal(true);
  };
  //--------------------------------
  //Sửa, Thu hồi, Xóa message
  const deleteMessage = async () => {
    const data = {
      conversation_id: conversation_id,
      user_id: user.id,
    };
    try {
      await MessageAPI.deleteMessage(selectMessage, data, accessToken);
      await fetchMessages();
      alert("Xóa thành công");
    } catch (err) {
      alert("Xóa thất bại: " + err.response.data.error);
    }
  };
  const updateMessage = async () => {
    const data = {
      conversation_id: conversation_id,
      user_id: user.id,
      content: editContent,
    };
    try {
      await MessageAPI.updateMessage(selectMessage, data, accessToken);
      await fetchMessages();

      setEdit(false); //dong Moddal update
      setEditContent("");

      alert("Cập nhật tin nhắn thành công");
    } catch (err) {
      alert(err.response.data.error);
    }
  };
  const revokeMessage = async () => {
    const data = {
      conversation_id: conversation_id,
      user_id: user.id,
    };
    try {
      await MessageAPI.revokeMessage(selectMessage, data, accessToken);
      await fetchMessages();
      alert("Thu hồi thành công");
    } catch (err) {
      alert(err.response.data.error);
    }
  };
  const forwardMessage = async () => {
    const currentMessage = messages.find(
      (message) => message.message_id == selectMessage
    );
    if (!currentMessage) {
      alert("khong tim thay tin nhan");
      return;
    }
    const receivers = [3];

    const data = {
      conversation_id: "eed7637a-ac78-4d87-baa6-f2a821029e07",
      sender: user.id,
      receivers: receivers,
      content: currentMessage.content,
      type: currentMessage.message_type,
      image_url: currentMessage.image_url || null,
    };
    try {
      const forwardMessage = await MessageAPI.sendMessage(data, accessToken);
      console.log("da forward: ", forwardMessage);
    } catch (err) {
      console.error("Send message failed: ", err.message);
    }
  };
  //-------------------------
  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender === user.id;
    const isRevoked = item.status === "REVOKED";
    const isUpdated = item.status === "UPDATED";
    const isContent =
      item.content && item.content !== null && item.content !== "null";
    const textStyle = isUpdated ? { fontWeight: "bold" } : {};

    return (
      <TouchableOpacity onLongPress={() => handleMessage(item.message_id)}>
        <View
          style={[
            styles.message,
            { alignSelf: isMyMessage ? "flex-end" : "flex-start" },
          ]}
        >
          {isRevoked ? (
            <Text style={{ color: "gray" }}>Tin nhắn đã thu hồi</Text>
          ) : (
            <>
              {isContent && <Text style={textStyle}>{item.content}</Text>}
              {item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    marginTop: item.content ? 5 : 0,
                  }}
                />
              )}
              {item.message_type === "FILE" && (
                // <TouchableOpacity
                //   onPress={() => Linking.openURL(item.image_url)}
                // >
                //   <Text style={{ color: "red" }}>
                //     {item.content || "📄 Tệp đính kèm"}
                //   </Text>
                // </TouchableOpacity>

                <Text style={{ color: "blue" }}>{item.image_url}</Text>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    fetchConversation();
    fetchMessages();
  }, [conversation_id, user]);
  //xin quyen truy cap anh tren dien thoai
  useEffect(() => {
    const requestPermission = async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Quyền truy cap anh bị từ chối!");
      }
    };
    requestPermission();
  }, []);

  const backToHomeChat = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={backToHomeChat}>
          <Image
            source={require("../assets/back.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../assets/user1.png")}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
          />
          <View>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              {conversation_id}
            </Text>
            <Text style={{ color: "#eee", fontSize: 12 }}>
              Hoạt động 10 phút trước
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.listMessage}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.message_id.toString()}
        />
        <Modal
          transparent={true}
          animationType="fade"
          visible={showMessageModal}
          onRequestClose={() => setShowMessageModal(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                onPress={deleteMessage}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Xóa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={revokeMessage}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Thu hồi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openEditContent}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Sửa</Text>
              </TouchableOpacity>
              {edit && (
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <TextInput
                    value={editContent}
                    onChangeText={setEditContent}
                    style={{
                      height: 40,
                      width: 200,
                      borderRadius: 20,
                      borderWidth: 1,
                      padding: 10,
                      marginBottom: 10,
                    }}
                  />
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={updateMessage}
                  >
                    <Text style={{ color: "red" }}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                onPress={forwardMessage}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Chuyển tiếp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowMessageModal(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      {selectedImage && (
        <View
          style={{
            width: "100%",
            height: 80,
            padding: 10,
            backgroundColor: "gray",
          }}
        >
          <Image
            source={{ uri: selectedImage.uri }}
            style={{ width: 60, height: 60 }}
          />
        </View>
      )}
      {selectedDocument && (
        <View>
          <Text>{selectedDocument.name}</Text>
          <Text>{selectedDocument.uri}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={selectDocument}>
          <Image
            source={require("../assets/documents.png")}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={selectImage}>
          <Image
            source={require("../assets/image.png")}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={selectEmoji}>
          <Image
            source={require("../assets/emoji.png")}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require("../assets/microphone.png")}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={handleSend}>
          <Image
            source={require("../assets/send.png")}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    height: 60,
    backgroundColor: "#6200ea",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  listMessage: { flex: 1, padding: 10 },
  message: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    maxWidth: "80%",
    width: "auto",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalButton: {
    padding: 10,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    color: "#6200ea",
  },
});
export default ChatScreen;
