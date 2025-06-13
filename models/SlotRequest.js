const db = require('../config/db');

exports.createSlotRequest = async (student_id, tutor_id, requested_slots) => {
  const { rows } = await db.query(
    `INSERT INTO slot_requests (student_id, tutor_id, requested_slots)
     VALUES ($1, $2, $3) RETURNING *`,
    [student_id, tutor_id, requested_slots]
  );
  return rows[0];
};

exports.updateSlotRequestStatus = async (id, status) => {
  const { rows } = await db.query(
    `UPDATE slot_requests SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows[0];
};
