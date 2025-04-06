import ConversationService from "../services/conversationService.js";

const createConversation = async (req, res) => {
  try {
    const data = req.body;
    const newConver = await ConversationService.createConversation(data);
    res.status(200).json(newConver);
  } catch (error) {
    res.status(400).json({
      message: "error create conversation controller",
      error: error.message,
    });
  }
};

const getAllConversations = async (req, res) => {
  const user_id = Number(req.params.user_id);
  console.log(user_id, typeof user_id);

  try {
    const lstConversations = await ConversationService.getAllConversation(
      user_id
    );
    res.status(200).json(lstConversations);
  } catch (error) {
    res.status(500).json({
      message: "Error get all conversations controller",
      error: error.message,
    });
  }
};
const updateConversation = async (req, res) => {
  const { conversation_id } = req.params;
  const { lastMessage } = req.body;

  if (!conversation_id || !lastMessage) {
    return res.status(400).json({
      message: "Invalid data for update conversation",
    });
  }

  try {
    const updatedConversation = await ConversationService.updateConver(
      conversation_id,
      lastMessage
    );
    res.status(200).json({
      message: "Conversation updated successfully",
      updatedConversation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating conversation controller",
      error: error.message,
    });
  }
};
export default { createConversation, getAllConversations, updateConversation };
