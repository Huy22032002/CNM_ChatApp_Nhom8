import { io } from "socket.io-client";

let socket;

export const createSocket = () => {
  if (!socket || !socket.connected) {
    socket = io("http://10.0.2.2:3000", {
      transports: ["websocket"],
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log("disconnected socket!");
  }
};

export default socket;
