const { handleChatMessage } = require("../controllers/chatController");
const { findOrCreateChatroom, getUserConversations } = require("../models/chatroomModel");
const { getLastMessages } = require("../models/messageModel");

module.exports = (io, socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // 🔹 Join specific chatroom
  socket.on("join-room", async ({ from, to }) => {
    try {
      const chatroom = await findOrCreateChatroom(from, to);
      const roomId = chatroom.id.toString();

      socket.join(roomId);
      console.log(`User ${from} joined room: ${roomId}`);

      const messages = await getLastMessages(chatroom.id);
      socket.emit("chat-history", { roomId, messages });
    } catch (err) {
      console.error("join-room error:", err);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // 🔹 Send message
  socket.on("send-message", (data) => {
    handleChatMessage(data, socket, io);
  });

  // 🔹 Fetch all conversations for the current user
  socket.on("get-conversations", async (userId) => {
    try {
      const rooms = await getUserConversations(userId.userId);
      socket.emit("conversations-list", rooms);
    } catch (error) {
      console.error("get-conversations error:", error);
      socket.emit("error", { message: "Failed to fetch conversations" });
    }
  });

  // 🔹 Disconnect
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
};
