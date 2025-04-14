import { v4 as uuidv4 } from "uuid";
import S3 from "../configs/configS3.js";
import MessageService from "../services/messageService.js";

const MessageController = {
  async sendImageMessage(req, res) {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Chưa gửi file" });

      const image = file.originalname.split(".");
      const fileType = image[image.length - 1];
      const filePath = `${uuidv4()}.${fileType}`;

      const params = {
        Bucket: "chatappnhom8",
        Key: filePath,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const uploadedImg = await S3.upload(params).promise();

      const data = req.body;
      const newMessage = {
        conversation_id: data.conversation_id,
        sender: data.sender,
        receivers: data.receivers,
        message_type: "image",
        image_url: uploadedImg.Location, //url s3 image
      };
      const savedMessage = await MessageService.createMessage(newMessage);
      return res.status(200).json(savedMessage);
    } catch (err) {
      console.log(`err upload img s3: ${err}`);
      return res.status(500).json({ err: err.message });
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
      return res.status(200).json(message);
    } catch (error) {
      return res.status(500).json({
        message: "error create message in message controler",
        error: error.message,
      });
    }
  },
  async getAllMessageByConversationId(req, res) {
    const converId = req.params.converId;
    if (!converId) {
      return res.status(400).json({ error: "Vui lòng truyền conversation_id" });
    }

    try {
      const lstMessage = await MessageService.getAllMessageByConversationId(
        converId
      );
      return res.status(200).json(lstMessage);
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
      const user_id = req.body.user_id;

      if (!message_id || !content || !user_id) {
        return res.status(400).json({
          error: "Vui lòng truyền đủ thông tin: message_id, user_id, content",
        });
      }

      const updatedMessage = await MessageService.updateMessageContent(
        message_id,
        user_id,
        content
      );
      if (!updatedMessage) {
        return res
          .status(404)
          .json({ error: "Message not found or update failed" });
      }
      res.status(200).json(updatedMessage);
    } catch (err) {
      console.error("Error updating message in mesage controler:", err.message);
      return res.status(500).json({
        message: "Error updating message in mesage controler",
        error: err.message,
      });
    }
  },
  async deleteMessage(req, res) {
    const message_id = req.params.message_id;
    const user_id = req.body.user_id;

    if (!message_id || !user_id) {
      return res.status(400).json({ error: "Thiếu message_id hoặc user_id" });
    }

    try {
      await MessageService.deleteMessage(message_id, user_id);
      return res
        .status(200)
        .json({ message: `deleted ${message_id} successfully!` });
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

    if (!message_id || !user_id) {
      return res.status(400).json({ error: "Thiếu message_id hoặc user_id" });
    }

    try {
      const revokedMessage = await MessageService.revokeMessage(
        message_id,
        user_id
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
