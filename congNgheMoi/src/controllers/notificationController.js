import * as notificationService from "../services/notificationService.js"; // hoặc import các hàm từ file bạn vừa gửi

export const createNotification = async (req, res) => {
  const { user_id, message, type } = req.body;
  try {
    const notification = await notificationService.createNotification(user_id, message, type);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// export const createFriendRequest = async (req, res) => {
//   const { sender_id, receiver_id } = req.body;
//   try {
//     const notification = await notificationService.createFriendRequestNotification(sender_id, receiver_id);
//     res.status(201).json(notification);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

export const createMessage = async (req, res) => {
  const { sender_id, receiver_id } = req.body;
  try {
    const notification = await notificationService.createMessageNotification(sender_id, receiver_id);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  const { user_id } = req.params;
  try {
    const notifications = await notificationService.getNotifications(user_id);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await notificationService.updateNotificationStatus(id, status);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await notificationService.deleteNotification(id);
    res.status(200).json(deleted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  const { user_id } = req.params;
  try {
    const count = await notificationService.getUnreadNotificationsCount(user_id);
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  const { user_id } = req.params;
  try {
    await notificationService.markAllNotificationsAsRead(user_id);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
