import dynamoDB from "../configs/connectDynamo.js";
import { v4 as uuidv4 } from "uuid"; //goi ham uuidv4

const TABLE_NAME = "Conversations";

const ConversationModel = {
  async createConversation(type, participants) {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        conversation_id: uuidv4(),
        type,
        participants: dynamoDB.createSet(participants),
        created_at: new Date().toISOString(),
        status: "ACTIVE", //chua can luu lastMessage
      },
    };
    await dynamoDB.put(params).promise();
    return params.Item;
  },
  async getAllConversationByUser(user_id) {
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
      throw new Error("error get all conversations model:", error.message);
    }
  },
  async getConversationById(conversation_id) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        conversation_id,
      },
    };
    try {
      const result = await dynamoDB.get(params).promise();
      console.log("type of converID: ", typeof conversation_id);

      console.log(`Conver ${conversation_id}: ${result.Item}`);
      return result.Item;
    } catch (err) {
      console.log("Error try catch fecth conver by id: ", err);
      throw new Error("Error try catch fecth conver by id: ", err);
    }
  },
  async updateConversation(conversation_id, lastMessage) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        conversation_id,
      },
      UpdateExpression: "set lastMessage = :lastMessages",
      ExpressionAttributeValues: {
        ":lastMessages": {
          content: lastMessage.content,
          updated_at: new Date().toISOString(),
        },
      },
      ReturnValues: "UPDATED_NEW", //return gia tri moi dc update
    };
    try {
      const result = await dynamoDB.update(params).promise();
      return result.Attributes;
    } catch (err) {
      console.log(`Error update conver ${conversation_id}: ${err}`);
      return null;
    }
  },
};

export default ConversationModel;
