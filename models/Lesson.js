const db = require('../config/db');

// Create lesson with status 'pending_payment'
exports.createPendingLesson = async ({ tutor_id, student_id, start_time, end_time, price, meeting_url,selectedDate }) => {
  const { rows } = await db.query(
    `INSERT INTO lessons (tutor_id, student_id, start_time, end_time, price, meeting_url, status,payment_status,lesson_date)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending_payment',0,$7)
     RETURNING *`,
    [tutor_id, student_id, start_time, end_time, price, meeting_url,selectedDate]
  );
  return rows[0];
};

// Update status after payment
exports.updateLessonStatus = async (lessonId, status) => {
  if(status=='upcoming') var payment_status=1;else var payment_status=2;
  const { rows } = await db.query(
    `UPDATE lessons SET status = $1,payment_status=$2 WHERE id = $3 RETURNING *`,
    [status, payment_status,lessonId]
  );
  return rows[0];
};
exports.getlessons = async (tutorId ) => {
 
  const query = `
    SELECT
      l.*,
      tutor.id AS tutor_id,
      tutor.first_name AS tutor_first_name,
      tutor.last_name AS tutor_last_name,
      tutor.email AS tutor_email,
      tutor.name AS tutor_full_name,
      student.id AS student_id,
      student.first_name AS student_first_name,
      student.last_name AS student_last_name,
      student.email AS student_email,
      student.name AS student_full_name
    FROM lessons l
    JOIN users AS tutor ON l.tutor_id = tutor.id
    JOIN users AS student ON l.student_id = student.id
    WHERE tutor.role = 'tutor' AND student.role = 'student' AND l.tutor_id = $1
    ORDER BY l.start_time ASC
  `;

  try {
    const result = await db.query(query, [tutorId]);
   return result.rows;
  } catch (error) {
    console.error('Error fetching tutor lessons:', error);
    return []
  }
};
exports.getStudentlessons = async (studentId ) => {
 
  const query = `
    SELECT
      l.*,
      tutor.id AS tutor_id,
      tutor.first_name AS tutor_first_name,
      tutor.last_name AS tutor_last_name,
      tutor.email AS tutor_email,
      tutor.name AS tutor_full_name,
      student.id AS student_id,
      student.first_name AS student_first_name,
      student.last_name AS student_last_name,
      student.email AS student_email,
      student.name AS student_full_name
    FROM lessons l
    JOIN users AS tutor ON l.tutor_id = tutor.id
    JOIN users AS student ON l.student_id = student.id
    WHERE tutor.role = 'tutor' AND student.role = 'student' AND l.student_id = $1
    ORDER BY l.start_time ASC
  `;

  try {
    const result = await db.query(query, [studentId]);
   return result.rows;
  } catch (error) {
    console.error('Error fetching tutor lessons:', error);
    return []
  }
};

