const db = require('../config/db');

exports.addAvailability = async (tutor_id, day_of_week, start_time, end_time, enable) => {
  const en = enable ? 1 : 0;
   const { rows } = await db.query(
    `INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, enable)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (tutor_id, day_of_week)
     DO UPDATE SET start_time = EXCLUDED.start_time,
                   end_time = EXCLUDED.end_time,
                   enable = EXCLUDED.enable
     RETURNING *`,
    [tutor_id, day_of_week, start_time, end_time, en]
  );

  return rows[0];
};
 

exports.getProfileAvailability = async (req, res) => {
  try {
    const { tutor_id } = req.params;

    if (!tutor_id) {
      return res.status(400).json({ message: 'Missing tutor_id' });
    }

    const { rows } = await db.query(
      `SELECT day_of_week, start_time, end_time, enable 
       FROM tutor_availability 
       WHERE tutor_id = $1`,
      [tutor_id]
    );

    // Create default structure
    const days = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    
    const availability = {};

    // Initialize all days with default values
    days.forEach(day => {
      availability[day] = {
        enable: false,
        start_time: '09:00',
        end_time: '17:00'
      };
    });

    // Fill from DB
    rows.forEach(row => {
      const { day_of_week, start_time, end_time, enable } = row;
      availability[days[day_of_week]] = {
        enable: enable === 1 || enable === true,
        start_time,
        end_time
      };
    });

    res.json({ availability });

  } catch (err) {
    console.error('Get Profile Availability Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
