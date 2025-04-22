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

const createGroupConversation = async (req, res) => {
  try {
    const data = req.body;
    const newConver = await ConversationService.createGroupConversation(data);
    res.status(200).json(newConver);
  }
  catch (error) {
    res.status(400).json({
      message: "error create group conversation controller",
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
const getConversationById = async (req, res) => {
  const conversation_id = req.params.conversation_id;
  if (!conversation_id) {
    return res.status(400).json({ error: "Vui lòng truyền conversation_id" });
  }
  try {
    const conversation = await ConversationService.getConversationById(
      conversation_id
    );
    console.log(conversation);
    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({
      message: "error get conversation with converId in conversation controler",
      error: error.message,
    });
  }
};

const addNewParticipant = async (req, res) => {
  const { conversation_id, newParticipant } = req.body;
  if (!conversation_id || !newParticipant) {
    return res.status(400).json({
      error: "Vui lòng truyền conversation_id và newParticipant",
    });
  }
  try {
    const updatedConversation = await ConversationService.addNewParticipant(
      conversation_id,
      newParticipant
    );
    return res.status(200).json(updatedConversation);
  } catch (error) {
    return res.status(500).json({
      message: "Error adding new participant to conversation",
      error: error.message,
    });
  }
};

const removeParticipant = async (req, res) => {
  const { conversation_id, participant } = req.body;
  if (!conversation_id || !participant) {
    return res.status(400).json({
      error: "Vui lòng truyền conversation_id và participant",
    });
  }
  try {
    const updatedConversation = await ConversationService.removeParticipant(
      conversation_id,
      participant
    );
    return res.status(200).json(updatedConversation);
  } catch (error) {
    return res.status(500).json({
      message: "Error removing participant from conversation",
      error: error.message,
    });
  }
};

const deleteConversation = async (req, res) => {
  const conversation_id = req.params.conversation_id;
  if (!conversation_id) {
    return res.status(400).json({ error: "Vui lòng truyền conversation_id" });
  }
  try {
    const deletedConversation = await ConversationService.deleteConversation(
      conversation_id
    );
    return res.status(200).json(deletedConversation);
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting conversation",
      error: error.message,
    });
  }
};

const getAllConversationsByType = async (req, res) => {
  const type = req.params.type;
  if (!type) {
    return res.status(400).json({ error: "Vui lòng truyền type" });
  }
  try {
    const conversations = await ConversationService.getAllConversationsByType(
      type
    );
    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({
      message: "Error getting conversations by type",
      error: error.message,
    });
  }
};

const updateGroupConversation1 = async (req, res) => {
  const { conversation_id, groupName } = req.body;
  if (!conversation_id || !groupName) {
    return res.status(400).json({
      message: "Invalid data for update group conversation",
    });
  }

  try {
    const updatedGroupConversation = await ConversationService.updateGroupConver(
      conversation_id,
      groupName
    );
    res.status(200).json({
      message: "Group conversation updated successfully",
      updatedGroupConversation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating group conversation controller",
      error: error.message,
    });
  }
};
const updateGroupConversation = async (req, res) => {
  try {
    const conversation_id = req.params.conversation_id;
    const groupDetailData = req.body;

    if (req.file) {
      const image = req.file.originalname.split(".");
      const fileType = image[image.length - 1];
      const filePath = `${uuidv4()}.${fileType}`;

      const params = {
        Bucket: "chatappnhom8",
        Key: filePath,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const uploadedImg = await S3.upload(params).promise();
      groupDetailData.group_avatar = uploadedImg.Location;
    } 

    // Gọi service update
    const updatedGroupDetail = await updateGroupConversation(
      conversation_id,
      groupDetailData
    )

    res.status(200).json({
      message: "Cập nhật group thành công!",
      groupDetail: updatedGroupDetail,
    });
  } catch (err) {
    console.error("Lỗi cập nhật group:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


export default {
  createConversation,
  getAllConversations,
  updateConversation,
  getConversationById,
  addNewParticipant,
  removeParticipant,
  deleteConversation,
  getAllConversationsByType,
  createGroupConversation,
  updateGroupConversation,

};
