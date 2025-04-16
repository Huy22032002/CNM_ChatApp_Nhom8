import { v4 as uuidv4 } from "uuid";
import S3 from "../configs/configS3.js";
import MessageService from "../services/messageService.js";

const MessageController = {
  async sendFileOrImageMessage(req, res) {
    try {
      const files = req.files;
      if (!files || (!files.image && !files.file)) {
        return res.status(400).json({ error: "No file or image provided" });
      }

      const file = files.image ? files.image[0] : files.file[0];
      const fileNameParts = file.originalname.split(".");
      const fileType = fileNameParts[fileNameParts.length - 1];
      const filePath = `${uuidv4()}.${fileType}`;

      const params = {
        Bucket: "chatappnhom8",
        Key: filePath,
        Body: file.buffer,
        ContentType: file.mimetype
      }; // Removed ACL: "public-read"

      console.log("Uploading file to S3 with params:", params);
      const uploadedFile = await S3.upload(params).promise();
      console.log("File uploaded to S3 successfully:", uploadedFile);
      console.log("S3 upload response:", uploadedFile);
      if (!uploadedFile || !uploadedFile.Location) {
        throw new Error("Failed to upload file to S3 or retrieve URL");
      }
      console.log("Image URL returned to frontend:", uploadedFile.Location);

      const data = req.body;
      console.log("Request body data:", data);

      const newMessage = {
        conversation_id: data.conversation_id,
        sender: Number(data.sender),
        receivers: data.receivers,
        message_type: file.mimetype.startsWith("image") ? "image" : "file",
        file_url: uploadedFile.Location, // URL S3 của file hoặc hình ảnh
        file_name: file.originalname, // Tên file gốc
        image_url: uploadedFile.Location, // Ensure image_url is passed to the database
      };

      console.log("Creating new message in database:", newMessage);
      const savedMessage = await MessageService.createMessage(newMessage);
      console.log("Message saved successfully:", savedMessage);
      const responseMessage = {
        ...savedMessage,
        image_url: savedMessage.file_url, // Map file_url to image_url for frontend compatibility
      };
      return res.status(200).json(responseMessage);
    } catch (err) {
      console.log(`err upload file or image to s3: ${err}`);
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
    console.log(converId);

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
        return res
          .status(200)
          .json({ message: `deleted message ${message_id} successfully!` });
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
