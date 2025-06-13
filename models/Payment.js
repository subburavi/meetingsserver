const db = require('../config/db');

exports.createPayment = async ({ lesson_id, student_id, amount, payment_method }) => {
  const { rows } = await db.query(
    `INSERT INTO payments (lesson_id, student_id, amount, payment_method)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [lesson_id, student_id, amount, payment_method]
  );
  return rows[0];
};
