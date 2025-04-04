import dynamoDB from "../configs/connectDynamo.js";
const { put, scan } = dynamoDB;
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = "Messages";

const MessageModel = {
  async createMessage(message) {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        message_id: uuidv4(),
        conversation_id: message.conversation_id,
        sender: message.sender,
        content: message.content,
        message_type: message.type,
        status: message.status,
        created_at: Date.now(),
      },
    };
    try {
      await put(params).promise();
      return params.Item;
    } catch (error) {
      throw new Error(`Err add message model ${error.message}`);
    }
  },
  async getAllMessageByConversationId(conversation_id) {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: "conversation_id = :convId",
      ExpressionAttributeValues: {
        ":convId": conversation_id,
      },
      ScanIndexForward: false,
    };
    try {
      const result = await scan(params).promise();
      return result.Items;
    } catch (error) {
      console.log(`error get all message of conver in model: ${error}`);
    }
  },
};

export default MessageModel;
