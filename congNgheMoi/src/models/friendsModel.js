import dynamoDB from "../configs/connectDynamo.js";

const TABLE_NAME = "User_Friends";

const friendsModel = {
  async createUserFriend(user_id) {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        user_id: user_id,
        friends: [],
      },
    };
    try {
      await dynamoDB.put(params).promise();
      return params.Item;
    } catch (err) {
      console.log(`Err create userfriend: ${err}`);
      return null;
    }
  },
  async addFriend(user_id, friend_id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { user_id },
      UpdateExpression: "set friends = list_append(friends, :friends)",
      ExpressionAttributeValues: {
        ":friends": [
          {
            friend_id: friend_id,
            status: "PENDING",
            created_at: new Date().toISOString(),
          },
        ],
      },
      ReturnValues: "ALL_NEW", //return toàn bộ data đc update
    };
    try {
      const result = await dynamoDB.update(params).promise();
      return result.Attributes;
    } catch (err) {
      console.log(`err try catch add friend ${err}`);
      return null;
    }
  },
  async getAllFriendOfUser(user_id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { user_id },
    };
    try {
      const result = await dynamoDB.get(params).promise();
      if (result.Item) {
        return result.Item.friends || [];
      } else {
        console.log(`cant found user with id: ${user_id}`);
        return [];
      }
    } catch (err) {
      console.log(`error try catch get all friends of user: ${err}`);
      return [];
    }
  },
};

module.exports = friendsModel;
