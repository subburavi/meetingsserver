const { findOrCreateChatroom, getUserConversations } = require("../models/chatroomModel");
const { createMessage } = require("../models/messageModel");

const handleChatMessage = async (data, socket, io) => {
  const { from, to, content, type } = data;

  const chatroom = await findOrCreateChatroom(from, to);
  const message = await createMessage(chatroom.id, from, to, content, type);

  io.to(chatroom.id.toString()).emit("new-message", { ...message, chatroom });
};
 const registerChatHandlers = (io, socket, userId) => {
  socket.on("get-conversations", async () => {
    try {
      const rooms = await getUserConversations(userId);
      socket.emit("conversations-list", rooms);
    } catch (error) {
      console.error("Error in get-conversations:", error);
      socket.emit("error", { message: "Failed to fetch conversations." });
    }
  });
};
module.exports = { handleChatMessage,registerChatHandlers };
