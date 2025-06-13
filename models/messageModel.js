const pool = require('../config/db');

const createMessage = async (chatroomId, senderId, receiverId, content, type = "message") => {
  const res = await pool.query(
    `INSERT INTO messages (chatroom_id, sender_id, receiver_id, content, type) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [chatroomId, senderId, receiverId, content, type]
  );
  return res.rows[0];
};

const markAsRead = async (messageId) => {
  await pool.query(
    `UPDATE messages SET is_read = true, read_at = NOW() WHERE id = $1`,
    [messageId]
  );
};
const getLastMessages = async (chatroomId, limit = 30) => {
  const res = await pool.query(
    `SELECT * FROM messages 
     WHERE chatroom_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [chatroomId, limit]
  );
  return res.rows.reverse(); // reverse to show oldest first
};

module.exports = {
  createMessage,
  markAsRead,
  getLastMessages
};

