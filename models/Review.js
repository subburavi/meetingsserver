const db = require('../config/db');

exports.createReview = async ({ lesson_id, student_id, rating, comment }) => {
  const { rows } = await db.query(
    `INSERT INTO reviews (lesson_id, student_id, rating, comment)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [lesson_id, student_id, rating, comment]
  );
  return rows[0];
};