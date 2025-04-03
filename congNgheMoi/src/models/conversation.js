const dynamoDB = require("../configs/connectDynamo");
const { v4: uuidv4 } = require("uuid"); //goi ham uuidv4

const TABLE_NAME = "Conversations";

const ConversationModel = {
  async createConversation(type, participants) {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        conversation_id: uuidv4(),
        type,
        participants: dynamoDB.createSet(participants),
        created_at: Date.now(),
        status: "ACTIVE",
      },
    };
    await dynamoDB.put(params).promise();
    return params.Item;
  },

  async getAllConversationBy(user_id) {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: "contains(participants, :user_id)",
      ExpressionAttributeValues: {
        ":user_id": user_id,
      },
    };
    try {
      const result = await dynamoDB.scan(params).promise();
      return result.Items || [];
    } catch (error) {
      console.error("error get all conversations model:", error);
      return [];
    }
  },
};

module.exports = ConversationModel;
