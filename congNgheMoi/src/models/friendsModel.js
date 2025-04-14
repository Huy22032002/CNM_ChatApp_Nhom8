import dynamoDB from "../configs/connectDynamo.js";

const TABLE_NAME = "User_Friends";

const friendsModel = {
  async createUserFriend(user_id) {
    if (isNaN(user_id)) {
      console.log(`Invalid user_id: ${user_id}`);
      return null;
    }
    const params = {
      TableName: TABLE_NAME,
      Item: {
        user_id: Number(user_id),
        friends: [],
      },
    };
    try {
      await dynamoDB.put(params).promise();
      console.log(`create userfriend with id: ${user_id}`);
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
      UpdateExpression: "SET friends = list_append(if_not_exists(friends, :empty_list), :friends)",
      ExpressionAttributeValues: {
        ":empty_list": [],
        ":friends": [
          {
            friend_id: friend_id,
            status: "PENDING",
            created_at: new Date().toISOString(),
            updated_at: null,
          },
        ],
      },
      ReturnValues: "ALL_NEW",
    };
    try {
      const result = await dynamoDB.update(params).promise();
      return result.Attributes;
    } catch (err) {
      console.log(`err try catch add friend ${err}`);
      return null;
    }
  },

  async acceptFriendRequest(user_id, friend_id) {
    try {
      const getParams = {
        TableName: TABLE_NAME,
        Key: { user_id },
      };
      const data = await dynamoDB.get(getParams).promise();
      const friends = data.Item?.friends || [];
  
      const updatedFriends = friends.map(f =>
        f.friend_id === friend_id
          ? { ...f, status: "ACCEPTED", updated_at: new Date().toISOString() }
          : f
      );
  
      const updateParams = {
        TableName: TABLE_NAME,
        Key: { user_id },
        UpdateExpression: "SET friends = :friends",
        ExpressionAttributeValues: {
          ":friends": updatedFriends,
        },
        ReturnValues: "ALL_NEW",
      };
  
      const result = await dynamoDB.update(updateParams).promise();
      return result.Attributes;
    } catch (err) {
      console.log(`Error accepting friend request ${err}`);
      return null;
    }
  },

  async deleteFriend(user_id, friend_id) {
    try {
      const getParams = {
        TableName: TABLE_NAME,
        Key: { user_id },
      };
      const data = await dynamoDB.get(getParams).promise();
      const friends = data.Item?.friends || [];

      const updatedFriends = friends.filter(f => f.friend_id !== friend_id);

      const updateParams = {
        TableName: TABLE_NAME,
        Key: { user_id },
        UpdateExpression: "SET friends = :friends",
        ExpressionAttributeValues: {
          ":friends": updatedFriends,
        },
        ReturnValues: "ALL_NEW",
      };

      const result = await dynamoDB.update(updateParams).promise();
      return result.Attributes;
    } catch (err) {
      console.log(`Error deleting friend ${err}`);
      return null;
    }
  },

  async blockUser(user_id, friend_id) {
    try {
      const getParams = {
        TableName: TABLE_NAME,
        Key: { user_id },
      };
      const data = await dynamoDB.get(getParams).promise();
      const friends = data.Item?.friends || [];
  
      const exists = friends.find(f => f.friend_id === friend_id);
      let updatedFriends;
  
      if (exists) {
        updatedFriends = friends.map(f =>
          f.friend_id === friend_id
            ? { ...f, status: "BLOCKED", updated_at: new Date().toISOString() }
            : f
        );
      } else {
        updatedFriends = [
          ...friends,
          {
            friend_id: friend_id,
            status: "BLOCKED",
            created_at: new Date().toISOString(),
            updated_at: null,
          },
        ];
      }
  
      const updateParams = {
        TableName: TABLE_NAME,
        Key: { user_id },
        UpdateExpression: "SET friends = :friends",
        ExpressionAttributeValues: {
          ":friends": updatedFriends,
        },
        ReturnValues: "ALL_NEW",
      };
  
      const result = await dynamoDB.update(updateParams).promise();
      return result.Attributes;
    } catch (err) {
      console.log(`Error blocking user ${err}`);
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

  async getFriends(user_id) {
    try {
      const params = {
        TableName: TABLE_NAME,
        Key: { user_id },
      };
      const data = await dynamoDB.get(params).promise();
      return data.Item?.friends?.filter(f => f.status === "ACCEPTED") || [];
    } catch (err) {
      console.log(`Error getFriends ${err}`);
      return [];
    }
  },

  async getPendingRequests(user_id) {
    try {
      const params = {
        TableName: TABLE_NAME,
        Key: { user_id },
      };
      const data = await dynamoDB.get(params).promise();
      return data.Item?.friends?.filter(f => f.status === "PENDING") || [];
    } catch (err) {
      console.log(`Error getPendingRequests ${err}`);
      return [];
    }
  },

  async cancelFriendRequest(user_id, friend_id) {
    try {
      const getParams = {
        TableName: TABLE_NAME,
        Key: { user_id },
      };
      const data = await dynamoDB.get(getParams).promise();
      const updatedFriends = (data.Item?.friends || []).filter(f =>
        !(f.friend_id === friend_id && f.status === "PENDING")
      );
  
      const updateParams = {
        TableName: TABLE_NAME,
        Key: { user_id },
        UpdateExpression: "SET friends = :friends",
        ExpressionAttributeValues: {
          ":friends": updatedFriends,
        },
        ReturnValues: "ALL_NEW",
      };
      const result = await dynamoDB.update(updateParams).promise();
      return result.Attributes;
    } catch (err) {
      console.log(`Error canceling friend request ${err}`);
      return null;
    }
  },

  async unblockUser(user_id, friend_id) {
    try {
      const getParams = {
        TableName: TABLE_NAME,
        Key: { user_id },
      };
      const data = await dynamoDB.get(getParams).promise();
      const friends = data.Item?.friends || [];
  
      const updatedFriends = friends.map(f =>
        f.friend_id === friend_id && f.status === "BLOCKED"
          ? { ...f, status: "PENDING", updated_at: new Date().toISOString() } // hoặc null nếu muốn xóa hẳn
          : f
      );
  
      const updateParams = {
        TableName: TABLE_NAME,
        Key: { user_id },
        UpdateExpression: "SET friends = :friends",
        ExpressionAttributeValues: {
          ":friends": updatedFriends,
        },
        ReturnValues: "ALL_NEW",
      };
      const result = await dynamoDB.update(updateParams).promise();
      return result.Attributes;
    } catch (err) {
      console.log(`Error unblocking user ${err}`);
      return null;
    }
  },
  
  async isFriend(user_id, friend_id) {
    try {
      const params = {
        TableName: TABLE_NAME,
        Key: { user_id },
      };
      const data = await dynamoDB.get(params).promise();
      const friend = data.Item?.friends?.find(f => f.friend_id === friend_id);
      return friend?.status === "ACCEPTED";
    } catch (err) {
      console.log(`Error checking isFriend ${err}`);
      return false;
    }
  },  
  
  async isBlocked(user_id, friend_id) {
    try {
      const params = {
        TableName: TABLE_NAME,
        Key: { user_id },
      };
      const data = await dynamoDB.get(params).promise();
      const friend = data.Item?.friends?.find(f => f.friend_id === friend_id);
      return friend?.status === "BLOCKED";
    } catch (err) {
      console.log(`Error checking isBlocked ${err}`);
      return false;
    }
  },  
  

};  

export default friendsModel;
