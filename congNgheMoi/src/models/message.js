import dynamoDB from "../configs/connectDynamo.js";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = "Messages";

const MessageModel = {
  async createMessage(message) {
    if (!message.conversation_id) {
      throw new Error("conversation_id is required to create a message.");
    }

    const params = {
      TableName: TABLE_NAME,
      Item: {
        message_id: uuidv4(),
        conversation_id: message.conversation_id,
        sender: message.sender,
        receivers: message.receivers,
        content: message.content,
        image_url: message.image_url || null,
        message_type: message.message_type || message.type,
        status: message.status,
        created_at: new Date().toISOString(),
        update_at: null,
      },
    };
    try {
      await dynamoDB.put(params).promise();
      return params.Item;
    } catch (error) {
      throw new Error(`Err add message model ${error.message}`);
    }
  },
  async getAllMessageByConversationId(conversation_id) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: "ConversationIndex", //ten GSI,
      KeyConditionExpression: "conversation_id = :converId",
      ExpressionAttributeValues: {
        ":converId": conversation_id,
      },
      ScanIndexForward: true, //sort từ cũ -> mới
    };
    try {
      const result = await dynamoDB.query(params).promise();
      return result.Items;
    } catch (error) {
      console.log(`error get all message of conver in model: ${error}`);
      return [];
    }
  },
  async updateMessageContent(message) {
    const { message_id, content } = message;
    const params = {
      TableName: TABLE_NAME,
      Key: {
        message_id,
      },
      UpdateExpression: "set content = :content, update_at = :update_at",
      ExpressionAttributeValues: {
        ":content": content,
        ":update_at": new Date().toISOString(),
      },
      ReturnValues: "UPDATED_NEW",
    };
    try {
      const result = await dynamoDB.update(params).promise();
      return result.Attributes;
    } catch (err) {
      console.log(`Error update message: ${err}`);
      return null;
    }
  },
};

export default MessageModel;
