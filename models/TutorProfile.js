const db = require('../config/db');

exports.createTutorProfile = async (user_id, data) => {
  const {
    bio, hourly_rate, timezone, intro_video_url, experience, languages, subjects
  } = data;

  const { rows } = await db.query(
    `INSERT INTO tutor_profiles 
      (user_id, bio, hourly_rate, timezone, intro_video_url, experience, languages, subjects)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [user_id, bio, hourly_rate, timezone, intro_video_url, experience, languages, subjects]
  );

  return rows[0];
};

exports.getProfiles = async ({ subject, native_language, min_rate, max_rate }) => {
  const filters = [];
  const values = [];
console.log({ subject, native_language, min_rate, max_rate });
  if (subject && subject.trim()) {
    filters.push(`$${values.length + 1} = ANY(subjects)`);
    values.push(subject.trim());
  }

  if (native_language && native_language.trim()) {
    filters.push(`$${values.length + 1} = ANY(native_languages)`);
    values.push(native_language.trim());
  }

  if (min_rate && !isNaN(min_rate)) {
    filters.push(`hourly_rate >= $${values.length + 1}`);
    values.push(Number(min_rate));
  }

  if (max_rate && !isNaN(max_rate)) {
    filters.push(`hourly_rate <= $${values.length + 1}`);
    values.push(Number(max_rate));
  }

  filters.push(`status='approved'`);
  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const query = `
    SELECT 
    tp.*, 
    u.name, u.avatar_url, u.first_name, u.last_name,
    COALESCE(AVG(r.rating), 0)::numeric(2,1) AS average_rating,
    COUNT(r.rating) AS rating_count
  FROM tutor_profiles tp
  LEFT JOIN users u ON tp.user_id = u.id
  LEFT JOIN reviews r ON r.user_id::uuid = tp.user_id
  ${whereClause}
  GROUP BY tp.id, u.id
  ORDER BY average_rating DESC;
  `;

  const { rows } = await db.query(query, values);
  return rows;
};


exports.getProfile = async (user_id) => {
  const query = `
    SELECT 
      tp.*, 
      u.name, u.avatar_url, u.first_name, u.last_name, u.email,
      COALESCE(AVG(r.rating), 0)::numeric(2,1) AS average_rating,
      COUNT(r.rating) AS rating_count,
      json_agg(json_build_object('rating', r.rating, 'comment', r.comment, 'created_at', r.created_at)) AS reviews
    FROM tutor_profiles tp
    LEFT JOIN users u ON tp.user_id = u.id
    LEFT JOIN reviews r ON r.user_id = tp.user_id
    WHERE tp.user_id = $1
    GROUP BY tp.id, u.id
    LIMIT 1;
  `;

  const { rows } = await db.query(query, [user_id]);
  return rows[0];
};


exports.getSimilarProfiles = async (user_id) => {
  const query = `
    SELECT 
      tp.*, 
      u.name, u.avatar_url, u.first_name, u.last_name, u.email,
      COALESCE(AVG(r.rating), 0)::numeric(2,1) AS average_rating,
      COUNT(r.rating) AS rating_count
    FROM tutor_profiles tp
    JOIN users u ON tp.user_id = u.id
    LEFT JOIN reviews r ON r.user_id = tp.user_id
    WHERE tp.user_id != $1
      AND tp.subjects && (
        SELECT subjects FROM tutor_profiles WHERE user_id = $1
      )  -- Array overlap operator
      AND tp.languages && (
        SELECT languages FROM tutor_profiles WHERE user_id = $1
      )
    GROUP BY tp.id, u.id
    ORDER BY average_rating DESC
    LIMIT 5;
  `;

  const { rows } = await db.query(query, [user_id]);
  return rows;
};



