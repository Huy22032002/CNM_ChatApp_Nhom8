import MessageModel from "../models/message.js";
const { getAllMessageByConversationId } = MessageModel;
import messageService from "../services/messageService.js";
const { createMessage: _createMessage, updateMessageContent } = messageService;
import { v4 as uuidv4 } from "uuid";
import S3 from "../configs/configS3.js";
import MessageService from "../services/messageService.js";

const MessageController = {
  async sendImageMessage(req, res) {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Chua gui file" });

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
      res.status(200).json(savedMessage);
    } catch (err) {
      console.log(`err upload img s3: ${err}`);
      res.status(500).json({ err: err.message });
    }
  },
  async createMessage(req, res) {
    try {
      const data = req.body;
      const message = await _createMessage(data);
      res.status(200).json(message);
    } catch (error) {
      res
        .status(500)
        .json({ message: "err add message controler", error: error.message });
    }
  },
  async getAllMessageByConversationId(req, res) {
    const converId = req.params.converId;
    console.log(converId);
    try {
      const lstMessage = await getAllMessageByConversationId(converId);
      res.status(200).json(lstMessage);
    } catch (error) {
      res.status(500).json({
        message: "err get message by converId controler",
        error: error.message,
      });
    }
  },
  async updateMessage(req, res) {
    try {
      const message = {
        message_id: req.params.message_id,
        content: req.body.content,
      };

      const updatedMessage = await updateMessageContent(message);
      if (!updatedMessage) {
        return res
          .status(404)
          .json({ error: "Message not found or update failed" });
      }
      res.status(200).json(updatedMessage);
    } catch (err) {
      console.error("Error updating message:", err);
      res.status(500).json({ error: err.message });
    }
  },
};

export default MessageController;
