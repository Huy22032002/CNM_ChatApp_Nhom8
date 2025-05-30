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
} from "react-native";
import MessageAPI from "../api/messageApi";
import ConversationApi from "../api/conversationApi";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { API_URL } from "../api/apiConfig";
import { Alert } from "react-native";
import { getSocket } from "../services/socket";
import PDFView from "../components/PDFView";
import ImageView from "../components/ImageView";
import { MaterialIcons } from "@expo/vector-icons";

const ChatGroupScreen = ({ route }) => {
  const { conversation_id, groupName, participants } = route.params;
  console.log(route.params);
  //lay userDetail cua cac participants roi lưu vao useState
  const [participantsDetail, setParticipantsDetail] = useState([]);

  const [conversation, setConversation] = useState(null);

  const user = useSelector((state) => state.user.user);
  const accessToken = useSelector((state) => state.user.accessToken);
  //state xu ly cac su kien message
  const [messages, setMessages] = useState([]);
  const [lastKey, setLastKey] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Modal state for message actions
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectMessage, setSelectMessage] = useState(null);
  const [edit, setEdit] = useState(false);
  const [editContent, setEditContent] = useState("");
  // Forward popup
  const [forwardPopUp, setForwardPopup] = useState(false);
  const [conversationsDetail, setConversationsDetail] = useState([]);

  const navigation = useNavigation();

  const fetchConversation = async () => {
    try {
      const data = await ConversationApi.fetchConversationsByConverId(
        conversation_id,
        accessToken
      );
      console.log("conversation 12134564646: ", data);
      setConversation(data);
    } catch (error) {
      console.error("Error fetching conversation: ", error);
    }
  };
  // Fetch messages for the group
  const fetchMessages = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const { messages: newMessages, lastKey: newLastKey } =
        await MessageAPI.fetchMessages(conversation_id, accessToken, lastKey);
      setMessages((prev) => [...prev, ...newMessages]);
      setLastKey(newLastKey);
      setHasMore(!!newLastKey); //false neu lastKey khong co
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchParticipantsDetail = async () => {
    // kiểm tra xem có đủ participants không (so sánh id trong participants với conversation.participants)
    if (!conversation) {
      console.log("Đang tải thông tin cuộc trò chuyện, vui lòng thử lại sau");
      return;
    }
    const isMatch = participants.every((participant) =>
      conversation.participants.includes(participant.user_id)
    );
    if (!isMatch) {
      console.log("Không đủ participants, đang tải thông tin chi tiết...");
      //lấy participantsDetail còn thiếu rồi thêm vào participants
      const missingParticipants = conversation.participants.filter(
        (participant) => !participants.includes(participant)
      );
      const missingParticipantsDetail = await Promise.all(
        missingParticipants.map(async (participant) => {
          const response = await fetch(
            `${API_URL}/api/userDetails/${participant}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          return data;
        })
      );
      setParticipantsDetail((prev) => [...prev, ...missingParticipantsDetail]);
    }

    setParticipantsDetail(participants);
    console.log("Huy ngu", participantsDetail);
  };

  // Get all conversations for forward
  const getListConversationDetail = async () => {
    try {
      const data = await ConversationApi.fetchConversationsByUserId(
        user.id,
        accessToken
      );
      setConversationsDetail(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cuộc trò chuyện: ", error);
    }
  };

  const openForwardPopup = () => {
    setForwardPopup(true);
    getListConversationDetail();
  };

  // Send a new message
  const handleSend = async () => {
    if (!newMessage.trim() && !selectedImage && !selectedDocument) {
      alert("Vui lòng nhập nội dung để gửi");
      return;
    }

    if (!conversation) {
      alert("Đang tải thông tin cuộc trò chuyện, vui lòng thử lại sau");
      return;
    }

    if (selectedImage || selectedDocument) {
      await sendImageAndText();
      setNewMessage("");
      setSelectedImage(null);
      setSelectedDocument(null);
      return;
    }

    const data = {
      conversation_id: conversation_id,
      sender: user.id,
      receivers: participants.filter((id) => id !== user.id),
      content: newMessage,
      type: "TEXT",
    };

    try {
      const result = await MessageAPI.sendMessage(data, accessToken);
      const receiveMessage = result.message;

      socket.emit("send message", receiveMessage);
      socket.emit("update conversation", result.updatedConversation);

      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
    }
  };

  // Send image or document
  const sendImageAndText = async () => {
    if (!conversation) {
      alert("Đang tải thông tin cuộc trò chuyện, vui lòng thử lại sau");
      return;
    }
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
      console.log("create message with file/img: ", response);
      socket.emit("send message", response);

      // fetchMessages();
      return response;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
        console.error("Error sending message:", err);
      }
    }
  };

  // Select image
  const selectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  // Select document
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

  // Message actions
  const handleMessage = (message_id) => {
    setSelectMessage(message_id);
    setShowMessageModal(true);
  };

  // Delete message
  // Delete message
  const deleteMessage = async () => {
    const data = {
      conversation_id: conversation_id,
      user_id: user.id,
    };

    try {
      const result = await MessageAPI.deleteMessage(
        selectMessage,
        data,
        accessToken
      );
      //socket
      const socketData = {
        message_id: result.id,
        conversation_id: conversation_id,
      };
      socket.emit("delete message", socketData);
      await fetchMessages();
      setShowMessageModal(false);
      alert("Xóa thành công");
    } catch (error) {
      console.error("Error deleting message:", error);

      // Hiển thị lỗi chi tiết nếu có
      if (error.response && error.response.data && error.response.data.error) {
        alert("Xóa thất bại: " + error.response.data.error);
      } else {
        alert("Xóa thất bại. Vui lòng thử lại sau.");
      }
    }
  };

  // Update message
  const updateMessage = async () => {
    try {
      const updatedMessage = await MessageAPI.updateMessage(
        selectMessage,
        { conversation_id, user_id: user.id, content: editContent },
        accessToken
      );
      fetchMessages();
      //socket
      socket.emit("update message", updatedMessage);

      setEdit(false);
      setEditContent("");
      setShowMessageModal(false);
      alert("Cập nhật tin nhắn thành công");
    } catch (error) {
      alert("Cập nhật thất bại");
    }
  };

  // Revoke message
  const revokeMessage = async () => {
    try {
      const revokedMessage = await MessageAPI.revokeMessage(
        selectMessage,
        { conversation_id, user_id: user.id },
        accessToken
      );
      //socket
      socket.emit("revoke message", revokedMessage);

      fetchMessages();
      setShowMessageModal(false);
      alert("Thu hồi thành công");
    } catch (error) {
      alert("Thu hồi thất bại");
    }
  };

  // Forward message
  const forwardMessage = async (
    forward_conversation_id,
    forward_participants
  ) => {
    const currentMessage = messages.find(
      (message) => message.message_id === selectMessage
    );
    if (!currentMessage) {
      alert("Không tìm thấy tin nhắn");
      return;
    }

    const data = {
      conversation_id: forward_conversation_id,
      sender: user.id,
      receivers: forward_participants.filter((id) => id !== user.id),
      content: currentMessage.content,
      type: currentMessage.message_type,
      image_url: currentMessage.image_url || null,
    };
    try {
      const result = await MessageAPI.sendMessage(data, accessToken);
      const forwardMessage = result.message;
      alert("Chuyển tiếp tin nhắn thành công!");
      //socket
      socket.emit("send message", forwardMessage);
      socket.emit("update conversation", result.updatedConversation);

      setShowMessageModal(false);
    } catch (error) {
      alert("Chuyển tiếp thất bại");
    }
  };

  const socket = getSocket();

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền bị từ chối", "Ứng dụng cần quyền truy cập ảnh.");
      }
    })();

    fetchConversation(); // Thêm dòng này
    // console.log("fetch cv: ", conversation);
    // fetchMessages();
    // fetchParticipantsDetail();

    //handle socket
    const handleReceiveMessage = (data) => {
      setMessages((prevMessages) => {
        if (prevMessages.some((msg) => msg.message_id === data.message_id)) {
          return prevMessages; // đã có, không thêm nữa
        }
        return [data, ...prevMessages];
      });
    };
    const handleRevokeMessage = (revokedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.message_id === revokedMessage.message_id ? revokedMessage : msg
        )
      );
    };
    const handleUpdatedMessage = (updatedMessage) => {
      setMessages((prev) =>
        prev.map((mes) =>
          mes.message_id === updatedMessage.message_id ? updatedMessage : mes
        )
      );
    };
    const handleDeleteMessage = (message_id) => {
      setMessages((prev) =>
        prev.filter((mes) => mes.message_id !== message_id)
      );
    };

    //socket
    socket.emit("group chat", { conversation_id: conversation_id });
    socket.on("join group chat", ({ conversation_id }) => {
      console.log("SO joined group", conversation_id);
    });
    //realtime user status

    socket.on("new message", handleReceiveMessage);
    socket.on("message revoked", handleRevokeMessage);
    socket.on("message updated", handleUpdatedMessage);
    socket.on("message deleted", handleDeleteMessage);

    return () => {
      socket.off("new message", handleReceiveMessage);
      socket.off("message revoked", handleRevokeMessage);
      socket.off("message updated", handleUpdatedMessage);
      socket.off("message deleted", handleDeleteMessage);
    };
  }, [conversation_id]);

  useEffect(() => {
    if (conversation && conversation.participants?.length > 0) {
      console.log(
        "Conversation đã có, bắt đầu fetch messages và participants detail"
      );
      fetchMessages();
      fetchParticipantsDetail(conversation);
    }
  }, [conversation]);
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
            styles.messageContainer,
            isMyMessage ? styles.myMessage : styles.otherMessage,
          ]}
        >
          {!isMyMessage && (
            <Image
              source={
                // Find sender in participantsDetail array
                participantsDetail.find((user) => user.user_id === item.sender)
                  ?.avatar_url
                  ? {
                      uri: participantsDetail.find(
                        (user) => user.user_id === item.sender
                      ).avatar_url,
                    }
                  : require("../assets/default-avatar.png")
              }
              style={styles.avatar}
            />
          )}
          <View style={styles.messageContent}>
            {!isMyMessage && (
              <Text style={styles.senderName}>
                {/* Get sender name from participantsDetail */}
                {participantsDetail.find((user) => user.user_id === item.sender)
                  ?.fullname || "Unknown user"}
              </Text>
            )}
            {isRevoked ? (
              <Text style={{ color: "gray" }}>Tin nhắn đã thu hồi</Text>
            ) : (
              <>
                {isContent && <Text style={textStyle}>{item.content}</Text>}
                {item.image_url && <ImageView message={item} />}
                {item.message_type === "pdf" && <PDFView message={item} />}
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ paddingTop: 30 }}></View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("homeChat")}>
          <Image
            source={require("../assets/back.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
        <Text style={styles.groupName}>{groupName}</Text>

        <View style={{ flex: 1 }}></View>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("groupInfoScreen", {
              conversation_id: conversation_id,
              groupName: groupName,
              participants: participants,
              admin_id: conversation?.admin_id,
            })
          }
        >
          <MaterialIcons name="info" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.message_id.toString()}
        onEndReached={fetchMessages}
        onEndReachedThreshold={0.1}
        inverted
        decelerationRate={"normal"}
      />

      {/* modal thuc hien updata, xoa, revoke, forward message */}
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
              onPress={() => setEdit(true)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Sửa</Text>
            </TouchableOpacity>
            {edit && (
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
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
              onPress={openForwardPopup}
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

      {/* Forward Popup */}
      {forwardPopUp && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.centeredModal}>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={() => setForwardPopup(false)}>
                <Text>X</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                Chọn cuộc trò chuyện để chuyển tiếp
              </Text>
              {conversationsDetail.map((c) => (
                <TouchableOpacity
                  key={c.conversation_id}
                  style={styles.conversationItem}
                  onPress={() => {
                    forwardMessage(c.conversation_id, c.participants);
                    setForwardPopup(false);
                  }}
                >
                  <Text style={styles.conversationText}>
                    {c.group_name || c.conversation_id}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      )}

      {/* Preview image/document */}
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

      {/* Input */}
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
        <TouchableOpacity onPress={() => setShowEmojiPicker(true)}>
          <Image
            source={require("../assets/emoji.png")}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={handleSend}>
          <Image
            source={require("../assets/send.png")}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
      </View>

      {/* Emoji Picker */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={showEmojiPicker}
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <FlatList
              data={[
                "😀",
                "😂",
                "😍",
                "😎",
                "😭",
                "😡",
                "👍",
                "🎉",
                "❤️",
                "🔥",
              ]}
              numColumns={5}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setNewMessage((prev) => prev + item);
                    setShowEmojiPicker(false);
                  }}
                >
                  <Text style={{ fontSize: 30, margin: 10 }}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
            <TouchableOpacity
              onPress={() => setShowEmojiPicker(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageContent: {
    maxWidth: "80%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    color: "#555",
    marginBottom: 5,
  },
  messageText: {
    fontSize: 16,
  },
  messageImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 5,
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
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  centeredModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  conversationItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  conversationText: {
    fontSize: 16,
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

export default ChatGroupScreen;
