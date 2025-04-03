const { getAllMessageByConversationId } = require("../models/message");
const MessageService = require("../services/messageService");

const MessageController = {
  async createMessage(req, res) {
    try {
      const data = req.body;
      const message = await MessageService.createMessage(data);
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
      const lstMessage = await MessageService.getAllMessageByConversationId(
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

module.exports = MessageController;
