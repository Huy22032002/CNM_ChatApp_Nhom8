import dynamoDB from "../configs/connectDynamo.js";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

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
        status: "SENT",
        created_at: new Date().toISOString(),
        updated_at: null,
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
  async updateMessageContent(message_id, user_id, conversation_id, content) {
    const message = await this.getMessage(message_id, user_id, conversation_id);
    if (!message) {
      throw new Error("khong tim thay message");
    }
    if (message.sender !== user_id) {
      //check nguoi gui co hop le khong
      throw new Error("Ban khong thể sửa tin nhan ng khác");
    }
    const currentTime = moment();
    const createdMessage = moment(message.created_at);
    const diff = currentTime.diff(createdMessage, "days");

    if (diff > 1) {
      throw new Error("Không thể cập nhật tin nhắn sau 1 ngày.");
    }

    const params = {
      TableName: TABLE_NAME,
      Key: {
        message_id,
        conversation_id: conversation_id,
      },
      UpdateExpression:
        "set content = :content, updated_at = :updated_at, #s = :status",
      ExpressionAttributeNames: {
        "#s": "status",
      },
      ExpressionAttributeValues: {
        ":content": content,
        ":updated_at": new Date().toISOString(),
        ":status": "UPDATED",
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
  async deleteMessage(message_id, user_id, conversation_id) {
    try {
      const message = await this.getMessage(
        message_id,
        user_id,
        conversation_id
      );
      if (!message) {
        throw new Error("khong tim thay message: ", message);
      }
      if (message.sender !== user_id) {
        //check nguoi gui co hop le khong
        throw new Error("Ban khong phai nguoi gui tin nhan");
      }
      const currentTime = moment();
      const create_at = moment(message.created_at);
      const diff = currentTime.diff(create_at, "minutes");

      if (diff > 5) {
        throw new Error("không thể xóa message > 5 phút");
      }
      const params = {
        TableName: TABLE_NAME,
        Key: {
          message_id: message_id,
          conversation_id: conversation_id,
        },
      };
      try {
        await dynamoDB.delete(params).promise();
      } catch (err) {
        throw new Error(err.message);
      }
    } catch (err) {
      throw new Error(err.message);
    }
  },
  async revokeMessage(message_id, user_id, conversation_id) {
    const message = await this.getMessage(message_id, user_id, conversation_id);
    if (!message) {
      throw new Error("khong tim thay message: ");
    }
    if (message.sender !== user_id) {
      //check nguoi gui co hop le khong
      throw new Error("Ban khong phai nguoi gui tin nhan");
    }

    const currentTime = moment();
    const createdMessage = moment(message.created_at);
    const diff = currentTime.diff(createdMessage, "days");

    if (diff > 1) {
      throw new Error("Không thể thu hồi tin nhắn quá 1 ngày");
    }
    const params = {
      TableName: TABLE_NAME,
      Key: {
        message_id: message_id,
        conversation_id: conversation_id,
      },
      UpdateExpression:
        "set #s = :status, content = :content ,updated_at = :updated_at",
      ExpressionAttributeNames: {
        "#s": "status",
      },
      ExpressionAttributeValues: {
        ":status": "REVOKED",
        ":content": null,
        ":updated_at": new Date().toISOString(),
      },
      ReturnValues: "UPDATED_NEW",
    };
    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  },
  async getMessage(message_id, user_id, conversation_id) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        message_id: message_id,
        conversation_id: conversation_id,
      },
    };
    try {
      const rs = await dynamoDB.get(params).promise();
      const message = rs.Item;

      return message;
    } catch (err) {
      throw new Error("lỗi get message: ", err.message);
    }
  },
};

export default MessageModel;
