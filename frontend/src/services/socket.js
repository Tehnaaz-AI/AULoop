import { io } from "socket.io-client";

let socket;

export const getSocket = (token) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      autoConnect: false
    });
  }
  socket.auth = { token };
  if (!socket.connected) socket.connect();
  return socket;
};

export const closeSocket = () => {
  if (socket) socket.disconnect();
  socket = null;
};
