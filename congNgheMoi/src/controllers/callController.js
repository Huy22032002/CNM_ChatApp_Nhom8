import * as callService from "../services/callService.js";

export const createCallRecord = async (req, res) => {
  try {
    const { callerId, receiverId, callType, startTime } = req.body;
    
    if (!callerId || !receiverId || !callType) {
      return res.status(400).json({ error: "Thiếu thông tin cuộc gọi" });
    }
    
    const call = await callService.createCallRecord(callerId, receiverId, callType, startTime);
    res.status(200).json(call);
  } catch (error) {
    console.error("Error creating call record:", error);
    res.status(500).json({ error: error.message || "Lỗi khi tạo bản ghi cuộc gọi" });
  }
};

export const updateCallRecord = async (req, res) => {
  try {
    const { callId } = req.params;
    const { endTime, status } = req.body;
    
    const call = await callService.updateCallRecord(callId, endTime, status);
    res.status(200).json(call);
  } catch (error) {
    console.error("Error updating call record:", error);
    res.status(500).json({ error: error.message || "Lỗi khi cập nhật bản ghi cuộc gọi" });
  }
};

export const getCallHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const history = await callService.getCallHistory(userId);
    res.status(200).json(history);
  } catch (error) {
    console.error("Error getting call history:", error);
    res.status(500).json({ error: error.message || "Lỗi khi lấy lịch sử cuộc gọi" });
  }
};

export const deleteCallRecord = async (req, res) => {
  try {
    const { callId } = req.params;
    
    await callService.deleteCallRecord(callId);
    res.status(200).json({ message: "Xóa bản ghi cuộc gọi thành công" });
  } catch (error) {
    console.error("Error deleting call record:", error);
    res.status(500).json({ error: error.message || "Lỗi khi xóa bản ghi cuộc gọi" });
  }
};