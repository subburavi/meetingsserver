const pool = require('../config/db');

const findOrCreateChatroom = async (userOne, userTwo) => {
  const sorted = [userOne, userTwo].sort();
  const res = await pool.query(
    `SELECT * FROM chatrooms WHERE user_one = $1 AND user_two = $2`,
    [sorted[0], sorted[1]]
  );
  if (res.rows.length) return res.rows[0];

  const insert = await pool.query(
    `INSERT INTO chatrooms (user_one, user_two) VALUES ($1, $2) RETURNING *`,
    [sorted[0], sorted[1]]
  );
  return insert.rows[0];
};
 
const getUserConversations = async (userId) => {
  const result = await pool.query(`
    SELECT 
      c.id AS chatroom_id,
      u.id AS user_id,
      u.name,
      u.avatar_url,
      m.content AS last_message,
      m.created_at AS last_message_time,
      COUNT(*) FILTER (WHERE ms.is_read IS NULL AND ms.sender_id != $1) AS unread_count
    FROM chatrooms c
    JOIN users u 
      ON u.id = CASE 
                  WHEN c.user_one = $1 THEN c.user_two 
                  ELSE c.user_one 
                END
    LEFT JOIN LATERAL (
      SELECT content, created_at
      FROM messages
      WHERE chatroom_id = c.id
      ORDER BY created_at DESC
      LIMIT 1
    ) m ON true
    LEFT JOIN messages ms 
      ON ms.chatroom_id = c.id
    WHERE c.user_one = $1 OR c.user_two = $1
    GROUP BY c.id, u.id, u.name, u.avatar_url, m.content, m.created_at
    ORDER BY m.created_at DESC NULLS LAST
  `, [userId]);

  return result.rows.map(row => ({
    id: row.chatroom_id,
    peerId: row.user_id,
    name: row.name,
    avatar: row.avatar_url?.charAt(0) || row.name.charAt(0),
    lastMessage: row.last_message || "No messages yet",
    time: row.last_message_time ? row.last_message_time : null,
    unread: parseInt(row.unread_count, 10) || 0
  }));
};


module.exports = { findOrCreateChatroom ,getUserConversations};
