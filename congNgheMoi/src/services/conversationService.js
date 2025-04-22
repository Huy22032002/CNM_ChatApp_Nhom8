import ConversationModel from "../models/conversation.js";

const ConversationService = {
  async createConversation(data) {
    const { type, participants } = data;

    //kiem tra du lieu dau vao
    if (!type || !participants || participants.length === 0) {
      throw new Error("invalid data create conversation service");
    }
    return await ConversationModel.createConversation(type, participants);
  },

  async createGroupConversation(data) {
    const { type, participants, group_name } = data;
    //kiem tra du lieu dau vao
    if (!type || !participants || participants.length === 0) {
      throw new Error("invalid data create group conversation service");
    }
    return await ConversationModel.createGroupConversation(
      type,
      participants,
      group_name
    );
  },

  async updateGroupConversation(data) {
    const { conversation_id, groupDetailData} = data;
    //kiem tra du lieu dau vao
    if (!conversation_id || !groupDetailData) {
      throw new Error("invalid data update group conversation service");
    }
    return await ConversationModel.updateGroupConversation(
      conversation_id,
      group_name= groupDetailData.group_name,
      group_avatar= groupDetailData.group_avatar
    );
  } ,


  async getAllConversation(user_id) {
    if (!user_id) {
      throw new Error("invalid user_id getAll Conversation service");
    }
    return await ConversationModel.getAllConversationByUser(user_id);
  },
  async getConversationById(conversation_id) {
    try {
      const conversation = await ConversationModel.getConversationById(
        conversation_id
      );
      return conversation;
    } catch (err) {
      throw new Error("error get conversation by id in service: ", err.message);
    }
  },
  async updateConver(conversation_id, lastMessage) {
    if (!conversation_id || !lastMessage) {
      console.log("update service: invalid data");
      throw new Error("Invalid data for update conversation");
    }
    try {
      return await ConversationModel.updateConversation(
        conversation_id,
        lastMessage
      );
    } catch (err) {
      console.log(`err update conversation sevice ${err}`);
      throw new Error("Error updating conversation service");
    }
  },

  async addNewParticipant(conversation_id, newParticipant) {
    if (!conversation_id || !newParticipant) {
      throw new Error("Invalid data for add participant conversation service");
    }
    try {
      return await ConversationModel.addNewParticipant(
        conversation_id,
        newParticipant
      );
    } catch (err) {
      console.log(`err add participant conversation service ${err}`);
      throw new Error("Error adding participant to conversation service");
    }
  },

  async removeParticipant(conversation_id, participant) {
    if (!conversation_id || !participant) {
      throw new Error("Invalid data for remove participant conversation service");
    }
    try {
      return await ConversationModel.removeParticipant(
        conversation_id,
        participant
      );
    } catch (err) {
      console.log(`err remove participant conversation service ${err}`);
      throw new Error("Error removing participant from conversation service");
    }
  },

  async deleteConversation(conversation_id) {
    if (!conversation_id) {
      throw new Error("Invalid data for delete conversation service");
    }
    try {
      return await ConversationModel.deleteConversation(conversation_id);
    } catch (err) {
      console.log(`err delete conversation service ${err}`);
      throw new Error("Error deleting conversation service");
    }
  },

  async getAllConversationsByType(type) {
    if (!type) {
      throw new Error("Invalid type for get all conversations by type service");
    }
    try {
      return await ConversationModel.getAllConversationsByType(type);
    } catch (err) {
      console.log(`err get all conversations by type service ${err}`);
      throw new Error("Error getting all conversations by type service");
    }
  },


};

export default ConversationService;
