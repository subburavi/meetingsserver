const db = require('../config/db');
 
exports.findUserByEmail = async (email) => {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

exports.findUserByGoogleId = async (googleId) => {
  const { rows } = await db.query('SELECT * FROM users WHERE "googleId" = $1', [googleId]);
  return rows[0];
};

exports.createUser = async ({ name, email, password,role,first_name,last_name }) => {
  const { rows } = await db.query(
    'INSERT INTO users (name, email, password,role,first_name,last_name) VALUES ($1, $2, $3,$4,$5,$6) RETURNING *',
    [name, email, password,role,first_name,last_name]
  );
  return rows[0];
};

exports.updateUserGoogleId = async (userId, googleId) => {
  const { rows } = await db.query(
    'UPDATE users SET "googleId" = $1 WHERE id = $2 RETURNING *',
    [googleId, userId]
  );
  return rows[0];
};

exports.createUserWithGoogle = async ({ name, email, googleId, avathar }) => {
  const { rows } = await db.query(
    'INSERT INTO users (name, email, "googleId", avathar,role) VALUES ($1, $2, $3, $4,$5) RETURNING *',
    [name, email, googleId, avathar,'student']
  );
  return rows[0];
};
exports.createTutorProfile = async ({ userId, phone, country, city, gender, dateOfBirth }) => {
  const result = await db.query(
    `INSERT INTO tutor_profiles (user_id, phone, country, city, gender, date_of_birth)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, phone, country, city, gender, dateOfBirth]
  );
  return result.rows[0];
};

exports.updateTutorProfileByUserId = async (userId, data) => {
  const {
    subjects,
    languages,
    nativeLanguages,
    teachingExperience,
    currentOccupation,
    education,
    previousTeachingRoles,
    certifications,
    motivationForTeaching,
    teachingStyle,
    ageGroups,
    lessonTypes,
    hasTeachingMaterials,
    willingToCreateMaterials,
    headline,
    description,
    trialRate,
    hourlyRate,
    timezone,
    responseTime,
    hasWebcam,
    hasHeadset,
    hasQuietSpace,
    internetConnection,
    teachingLocation,
    backgroundCheck,
    completed_steps,
     profile_image,
    video_intro,
    identity_document,
    certificate_files
  } = data;
if(completed_steps==6) var status='submitted';else var status="incomplete";
  const result = await db.query(
    `UPDATE tutor_profiles SET
      subjects = $1,
      languages = $2,
      native_languages = $3,
      teaching_experience = $4,
      current_occupation = $5,
      education = $6,
      previous_teaching_roles = $7,
      certifications = $8,
      motivation_for_teaching = $9,
      teaching_style = $10,
      age_groups = $11,
      lesson_types = $12,
      has_teaching_materials = $13,
      willing_to_create_materials = $14,
      headline = $15,
      description = $16,
      trial_rate = $17,
      hourly_rate = $18,
      timezone = $19,
      response_time = $20,
      has_webcam = $21,
      has_headset = $22,
      has_quiet_space = $23,
      internet_connection = $24,
      teaching_location = $25,
      background_check = $26,
      completed_steps=$27,
      status=$28,
      profile_image=$29,
      video_intro=$30,
      identity_document=$31,
    certificate_files=$32,
      updated_at = NOW()
    WHERE user_id = $33
    RETURNING *`,
    [
      subjects,
      languages,
      nativeLanguages,
      teachingExperience || null,
      currentOccupation || null,
      education || null,
      previousTeachingRoles || null,
      certifications,
      motivationForTeaching || null,
      teachingStyle || null,
      ageGroups,
      lessonTypes,
      hasTeachingMaterials,
      willingToCreateMaterials,
      headline || null,
      description || null,
      trialRate === '' ? null : parseFloat(trialRate),
      hourlyRate === '' ? null : parseFloat(hourlyRate),
      timezone || null,
      responseTime || null,
      hasWebcam,
      hasHeadset,
      hasQuietSpace,
      internetConnection || null,
      teachingLocation || null,
      backgroundCheck,
      completed_steps+1 || null,
      status,
      profile_image,
      video_intro,
      identity_document,
    certificate_files,
      userId
    ]
  );

  return result.rows[0];
};


exports.findTutorProfileByUserId = async (user_id) => {
  const { rows } = await db.query('SELECT * FROM tutor_profiles WHERE user_id = $1', [user_id]);
  return rows[0];
};