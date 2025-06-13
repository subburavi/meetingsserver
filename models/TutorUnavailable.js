
const db = require('../config/db');

exports.markUnavailable = async (tutor_id, date, reason) => {
  const { rows } = await db.query(
    `INSERT INTO tutor_unavailable (tutor_id, date, reason)
     VALUES ($1, $2, $3) RETURNING *`,
    [tutor_id, date, reason]
  );
  return rows[0];
};