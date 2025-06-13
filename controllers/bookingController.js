const bcrypt = require('bcryptjs');
const db = require('../config/db');

const generateSlots = (startTime, endTime) => {
  // Assuming startTime and endTime are strings like "09:00", "17:00"
  const slots = [];
  let [startH, startM] = startTime.split(":").map(Number);
  let [endH, endM] = endTime.split(":").map(Number);

  // Convert start and end to minutes from midnight
  let startTotalMins = startH * 60 + startM;
  const endTotalMins = endH * 60 + endM;

  while (startTotalMins + 30 <= endTotalMins) {
    const h = Math.floor(startTotalMins / 60);
    const m = startTotalMins % 60;
    slots.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    );
    startTotalMins += 30;
  }

  return slots;
};

exports.availableSlots = async (req, res) => {
  try {
    const { tutorId, date } = req.body;
    const dayOfWeek = new Date(date).getDay(); // 0-6
console.log(dayOfWeek)
    // 1. Get tutor's base availability
    const availability = await db.query(
      `SELECT start_time, end_time FROM tutor_availability
       WHERE tutor_id = $1 AND day_of_week = $2`,
      [tutorId, dayOfWeek]
    );

    if (!availability.rows.length) return res.json({ available_slots: [] });

    const { start_time, end_time } = availability.rows[0];
    // Assuming start_time and end_time are strings "HH:mm" or "HH:mm:ss"
    const startTimeStr = start_time.slice(0,5);
    const endTimeStr = end_time.slice(0,5);

    // 2. Generate all possible slots
    const allSlots = generateSlots(startTimeStr, endTimeStr);

    // 3. Get booked lessons on that date with payment_status = 1 (paid)
    const booked = await db.query(
      `SELECT start_time FROM lessons WHERE payment_status=1 AND tutor_id = $1 AND lesson_date = $2`,
      [tutorId, date]
    );
console.log(date,booked)

    // Normalize booked start times to HH:mm format in local timezone
  const bookedTimes = booked.rows.map(row => {
  const dateObj = new Date(row.start_time);
  const h = dateObj.getHours();   // 0 to 23 hours
  const m = dateObj.getMinutes(); // 0 to 59 minutes
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

console.log(bookedTimes);
    // 4. Map all slots marking booked as unavailable
    const available_slots = allSlots.map(slot => ({
      time: slot,
      is_available: !bookedTimes.includes(slot),
    }));

    res.json({ available_slots });
  } catch (err) {
    console.error('Fetch Tutor Profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
