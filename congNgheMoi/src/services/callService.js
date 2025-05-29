import CallModel from "../models/callModel.js";

export const createCallRecord = async (callerId, receiverId, callType, startTime) => {
  try {
    const call = await CallModel.create({
      caller_id: callerId,
      receiver_id: receiverId,
      call_type: callType,
      start_time: startTime || new Date().toISOString(),
      status: "INITIATED"
    });
    
    return call;
  } catch (error) {
    console.error("Error creating call record in service:", error);
    throw error;
  }
};

export const updateCallRecord = async (callId, endTime, status) => {
  try {
    const call = await CallModel.findByPk(callId);
    
    if (!call) {
      throw new Error("Không tìm thấy bản ghi cuộc gọi");
    }
    
    if (endTime) call.end_time = endTime;
    if (status) call.status = status;
    
    await call.save();
    return call;
  } catch (error) {
    console.error("Error updating call record in service:", error);
    throw error;
  }
};

export const getCallHistory = async (userId) => {
  try {
    const calls = await CallModel.findAll({
      where: {
        [Op.or]: [
          { caller_id: userId },
          { receiver_id: userId }
        ]
      },
      order: [['start_time', 'DESC']]
    });
    
    return calls;
  } catch (error) {
    console.error("Error getting call history in service:", error);
    throw error;
  }
};

export const deleteCallRecord = async (callId) => {
  try {
    const call = await CallModel.findByPk(callId);
    
    if (!call) {
      throw new Error("Không tìm thấy bản ghi cuộc gọi");
    }
    
    await call.destroy();
    return true;
  } catch (error) {
    console.error("Error deleting call record in service:", error);
    throw error;
  }
};