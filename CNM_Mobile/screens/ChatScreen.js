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
  Alert,
} from "react-native";
import MessageAPI from "../api/messageApi";
import ConversationApi from "../api/conversationApi";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

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
  const sendMessage = async () => {
    if (newMessage == "" || newMessage == null) {
      alert("vui lòng nhập nội dung để gửi");
      return;
    }
    const receivers = conversation.participants.filter(
      (participant) => participant != user.id
    );
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
  const handleMessage = (message_id) => {
    console.log("select message id: ", message_id);
    setSelectMessage(message_id);
    setShowMessageModal(true);
  };

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
      content: newMessage,
    };
    await MessageAPI.updateMessage(selectMessage, data, accessToken);
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
  const forwardMessage = async () => {};
  //-------------------------

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender === user.id;
    //kiem tra tin nhan REVOKED chua
    const isRevoked = item.status === "REVOKED";
    const isUpdated = item.status === "UPDATED";
    return (
      <TouchableOpacity
        onLongPress={() => {
          handleMessage(item.message_id);
        }}
      >
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
              {item.content && <Text>{item.content}</Text>}
              {item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  style={{ width: 80, height: 80, borderRadius: 20 }}
                />
              )}
              {item.content && item.status === "UPDATED" && (
                <Text style={{ fontWeight: "bold" }}>{item.content}</Text>
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

  const backToHomeChat = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{conversation_id}</Text>
        <Text>Hoạt động 10 phút trước</Text>
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
          onRequestClose={() => setShowActions(false)}
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
                onPress={updateMessage}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Sửa</Text>
              </TouchableOpacity>
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
      <View style={styles.footer}>
        <TouchableOpacity onPress={backToHomeChat}>
          <Image
            source={require("../assets/microphone.png")}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require("../assets/documents.png")}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require("../assets/image.png")}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
        <TouchableOpacity>
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
        <TouchableOpacity onPress={sendMessage}>
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
    justifyContent: "center",
    alignItems: "center",
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
