const express = require('express');
const { register, login, googleAuthVerify, registerTutor, updateTutorProfile, getProfiles } = require('../controllers/authController');
const { getTutorProfile, addProfileAvailability } = require('../controllers/profileController');
const { availableSlots } = require('../controllers/bookingController');
const { createCheckoutSession, confirmPaymentSuccess } = require('../controllers/paymentController');
const { getProfileAvailability } = require('../models/TutorAvailability');
const { getlessons, getStudentlessons } = require('../controllers/LessonController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/googleauthverify', googleAuthVerify);
router.post('/registertutor', registerTutor);
router.post('/updatetutorprofile', updateTutorProfile);
router.get('/tutor/profile/:userid',getTutorProfile)
router.get('/getprofiles',getProfiles)
router.post('/availability',availableSlots)
router.post('/create-checkout-session',createCheckoutSession)
router.post('/update-lesson-status', confirmPaymentSuccess);
router.post('/addavailability', addProfileAvailability);
router.get('/availability/:tutor_id', getProfileAvailability);
router.get('/tutor/lessons/:tutorId', getlessons);
router.get('/student/lessons/:studentId', getStudentlessons);


module.exports = router;
