import MessageModel from "../models/message.js";
const { getAllMessageByConversationId } = MessageModel;
import messageService from "../services/messageService.js";
const { createMessage: _createMessage } = messageService;

const MessageController = {
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
      const lstMessage = await getAllMessageByConversationId(
        converId
      );
      res.status(200).json(lstMessage);
    } catch (error) {
      res.status(500).json({
        message: "err get message by converId controler",
        error: error.message,
      });
    }
  },
};

export default MessageController;
