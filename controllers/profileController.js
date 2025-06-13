const bcrypt = require('bcryptjs');
const { getProfile, getProfiles, getSimilarProfiles } = require('../models/TutorProfile');
const { addAvailability } = require('../models/TutorAvailability');
 
exports.getTutorProfile = async (req, res) => {
 try {
    const { userid } = req.params;
    const profile = await getProfile(userid);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    const simillerprofile=await getSimilarProfiles(userid);
    res.json({profile,simillerprofile});
  } catch (err) {
    console.error('Fetch Tutor Profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.addProfileAvailability = async (req, res) => {
  try {
    const { tutor_id, availability } = req.body;

    if (!tutor_id || !availability || typeof availability !== 'object') {
      return res.status(400).json({ message: 'Missing tutor_id or availability' });
    }

    // Mapping day names to numbers (Monday = 0, Sunday = 6)
    const dayMap = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 0
    };

    for (const day in availability) {
      const dayData = availability[day];

      await addAvailability(
        tutor_id,
        dayMap[day], // convert day string to number
        dayData.start_time,
        dayData.end_time,
        dayData.enable
      );
    }

    res.json({ status: 'success' });
  } catch (err) {
    console.error('Add Profile Availability Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
