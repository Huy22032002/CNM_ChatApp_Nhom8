import { v4 as uuidv4 } from "uuid";
import S3 from "../configs/configS3.js";
import MessageService from "../services/messageService.js";
import ConversationService from "../services/conversationService.js";

const MessageController = {
  async sendImageMessage(req, res) {
    try {
      const file = req.files?.image?.[0] || req.files?.file?.[0];
      if (!file) return res.status(400).json({ error: "Chưa gửi file" });

      const fileExtension = file.originalname.split(".").pop();
      const filePath = `${uuidv4()}.${fileExtension}`;

      const isImg = file.mimetype.startsWith("image/");
      const isPdf = file.mimetype === "application/pdf";
      if (!isImg && !isPdf) {
        return res
          .status(400)
          .json({ error: "Chỉ chấp nhận hình ảnh hoặc PDF" });
      }

      const params = {
        Bucket: "chatappnhom8",
        Key: filePath,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const uploadedImg = await S3.upload(params).promise();

      const data = req.body;
      const isContent = data.content && data.content.trim() !== "";

      let message_type = "";
      if (isContent && isImg) {
        message_type = "image_text";
      } else if (isImg) {
        message_type = "image";
      } else if (isPdf) {
        message_type = "pdf";
      } else {
        message_type = "file";
      }

      const newMessage = {
        conversation_id: data.conversation_id,
        sender: Number(data.sender),
        receivers: data.receivers,
        message_type: message_type,
        content: isContent ? data.content : null,
        image_url: uploadedImg.Location,
      };

      const savedMessage = await MessageService.createMessage(newMessage);
      return res.status(200).json(savedMessage);
    } catch (err) {
      console.log(`err upload img s3: ${err}`);
      return res.status(500).json({ error: err.message });
    }
  },

  async createMessage(req, res) {
    try {
      const data = req.body;
      if (!data) {
        return res
          .status(400)
          .json({ error: "Vui lòng nhập đủ thông tin để tạo message" });
      }
      const message = await MessageService.createMessage(data);
      console.log("create message: ", message);

      //update conversation
      const lastMessage = {
        content: message.content,
        updated_at: message.created_at,
      };
      const updatedConversation = await ConversationService.updateConver(
        message.conversation_id,
        lastMessage
      );
      console.log(
        "update conversation after create new message: ",
        updatedConversation
      );
      return res.status(200).json({ message, updatedConversation });
    } catch (error) {
      return res.status(500).json({
        message: "error create message in message controler",
        error: error.message,
      });
    }
  },
  async getAllMessageByConversationId(req, res) {
    const converId = req.params.converId;
    const lastKey = req.query.lastKey ? JSON.parse(req.query.lastKey) : null;
    console.log("last key: ", lastKey);

    if (!converId) {
      return res.status(400).json({ error: "Vui lòng truyền conversation_id" });
    }

    try {
      const lstMessage = await MessageService.getAllMessageByConversationId(
        converId,
        lastKey
      );
      return res.status(200).json({
        messages: lstMessage.messages,
        lastEvaluatedKey: lstMessage.lastEvaluatedKey || null,
      });
    } catch (error) {
      return res.status(500).json({
        message: "error get all messages with converId in message controler",
        error: error.message,
      });
    }
  },
  async updateMessage(req, res) {
    try {
      const message_id = req.params.message_id;
      const content = req.body.content;
      const conversation_id = req.body.conversation_id;
      const user_id = req.body.user_id;

      if (!message_id || !content || !user_id || !conversation_id) {
        return res.status(400).json({
          error:
            "Vui lòng truyền đủ thông tin: message_id, user_id, conversation_id, content",
        });
      }

      const updatedMessage = await MessageService.updateMessageContent(
        message_id,
        user_id,
        conversation_id,
        content
      );
      if (!updatedMessage) {
        return res
          .status(404)
          .json({ error: "Message update failed in Message Controller" });
      }
      res.status(200).json(updatedMessage);
    } catch (err) {
      console.error("Error updating message in mesage controler:", err.message);
      return res.status(500).json({
        error: err.message,
      });
    }
  },
  async deleteMessage(req, res) {
    const message_id = req.params.message_id;
    const user_id = req.body.user_id;
    const conversation_id = req.body.conversation_id;

    if (!message_id || !user_id || !conversation_id) {
      return res
        .status(400)
        .json({ error: "Thiếu message_id or user_id or conversation_id" });
    }

    try {
      const rs = await MessageService.deleteMessage(
        message_id,
        user_id,
        conversation_id
      );
      if (rs)
        return res.status(200).json({
          message: `deleted message ${message_id} successfully!`,
          id: `${message_id}`,
        });
    } catch (err) {
      return res.status(500).json({
        message: "Error Delete Message in Message Controller",
        error: err.message,
      });
    }
  },
  async revokeMessage(req, res) {
    const message_id = req.params.message_id;
    const user_id = req.body.user_id;
    const conversation_id = req.body.conversation_id;

    if (!message_id || !user_id || !conversation_id) {
      return res
        .status(400)
        .json({ error: "Thiếu message_id hoặc user_id hoặc conversation_id" });
    }

    try {
      const revokedMessage = await MessageService.revokeMessage(
        message_id,
        user_id,
        conversation_id
      );
      if (!revokedMessage) {
        return res.status(400).json({ message: `Revoked Message Failed` });
      }
      return res.status(200).json({
        message: "Revoked Message Successfully!",
        revokedMessage: revokedMessage,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Error Revoke Message in Message Controller",
        error: err.message,
      });
    }
  },
};

export default MessageController; 
