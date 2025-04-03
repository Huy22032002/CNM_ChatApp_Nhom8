const dynamoDB = require("../configs/connectDynamo");
const { v4: uuidv4 } = require("uuid");

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
      await dynamoDB.put(params).promise();
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
      const result = await dynamoDB.scan(params).promise();
      return result.Items;
    } catch (error) {
      console.log(`error get all message of conver in model: ${error}`);
    }
  },
};

module.exports = MessageModel;
