import Notification from "../models/notification.js";
import { Op } from "sequelize";
import User from "../models/userModel.js";

export async function createNotification(user_id, message, type) {
    try {
        const notification = await Notification.create({
            user_id,
            message,
            type,
            status: "PENDING",
        });
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error.message);
        throw error;
    }
}

export async function createFriendRequestNotification(sender_id, receiver_id) {
    try {
        const message = `User ${sender_id} sent you a friend request`;
        const notification = await createNotification(receiver_id, message, "FRIEND_REQUEST");
        return notification;
    } catch (error) {
        console.error("Error creating friend request notification:", error.message);
        throw error;
    }
}

export async function createMessageNotification(sender_id, receiver_id) {
    try {
        const message = `User ${sender_id} sent you a message`;
        const notification = await createNotification(receiver_id, message, "MESSAGE");
        return notification;
    } catch (error) {
        console.error("Error creating message notification:", error.message);
        throw error;
    }
}

export async function getNotifications(user_id) {
    try {
        const notifications = await Notification.findAll({
            where: { user_id },
            order: [["created_at", "DESC"]],
        });
        return notifications;
    } catch (error) {
        console.error("Error fetching notifications:", error.message);
        throw error;
    }
}

export async function updateNotificationStatus(id, status) {
    try {
        const notification = await Notification.findByPk(id);
        if (!notification) {
            throw new Error("Notification not found");
        }
        notification.status = status;
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error updating notification status:", error.message);
        throw error;
    }
}

export async function deleteNotification(notification_id) {
    try {
        const notification = await Notification.findByPk(notification_id);
        if (!notification) {
            throw new Error("Notification not found");
        }
        await notification.destroy();
        return notification;
    } catch (error) {
        console.error("Error deleting notification:", error.message);
        throw error;
    }
}

export async function getUnreadNotificationsCount(user_id) {
    try {
        const count = await Notification.count({
            where: {
                user_id,
                status: "PENDING",
            },
        });
        return count;
    } catch (error) {
        console.error("Error fetching unread notifications count:", error.message);
        throw error;
    }
}

export async function markAllNotificationsAsRead(user_id) {
    try {
        await Notification.update(
            { status: "DONE" },
            {
                where: {
                    user_id,
                    status: "PENDING",
                },
            }
        );
    } catch (error) {
        console.error("Error marking all notifications as read:", error.message);
        throw error;
    }
}

