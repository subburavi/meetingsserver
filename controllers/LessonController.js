const bcrypt = require('bcryptjs');
const { getlessons, getStudentlessons } = require('../models/Lesson');
 
 
exports.getlessons = async (req, res) => {
 try {
    const { tutorId } = req.params;
    console.log(tutorId);
    const rows = await getlessons(tutorId);
   
     res.status(200).json(rows);
  } catch (err) {
    console.error('Fetch Tutor Profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getStudentlessons = async (req, res) => {
 try {
    const { studentId } = req.params;
    console.log(studentId);
    const rows = await getStudentlessons(studentId);
   
     res.status(200).json(rows);
  } catch (err) {
    console.error('Fetch Tutor Profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

