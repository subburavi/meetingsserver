const bcrypt = require('bcryptjs');
const { findUserByEmail, createUser, findUserByGoogleId, createUserWithGoogle, createTutorProfile, updateTutorProfileByUserId, findTutorProfileByUserId, updateUserGoogleId } = require('../models/User');
const generateToken = require('../utils/generateToken');
const { getProfile, getProfiles } = require('../models/TutorProfile');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await findUserByEmail(email);
  if (existing) return res.status(400).json({ message: 'User exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, password: hashed });
  const token = generateToken(user.id);
  res.json({ user, token });
};
exports.getTutorProfile = async (req, res) => {
 try {
    const { userid } = req.params;
    const profile = await getProfile(userid);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error('Fetch Tutor Profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.updateTutorProfile = async (req, res) => {
  const {
    userid,
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
  } = req.body;

  try {
    if (!userid) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Call DB layer to update tutor profile
    const updated = await updateTutorProfileByUserId(userid, {
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
    });

    if (!updated) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    res.json({ status: 'success', message: 'Tutor profile updated successfully' });

  } catch (err) {
    console.error('updateTutorProfile Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.registerTutor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      country,
      city,
      gender,
      dateOfBirth,
    } = req.body;

    // Check if user exists
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
var name=firstName+' '+lastName;
    // Create user
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role: 'tutor',
      first_name:firstName,
      last_name:lastName
    });

    // Create tutor profile
    const profile = await createTutorProfile({
      userId: user.id,
      phone,
      country,
      city,
      gender,
      dateOfBirth,
    });

    // Generate access token
    const token = generateToken(user.id);

    res.status(201).json({
      status:"success",
      message: 'Tutor registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_status:profile.status
      },
      profile,
      token,
    });
  } catch (err) {
    console.error('RegisterTutor Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

if(user.role=='tutor'){
   var pro=await findTutorProfileByUserId(user.id);
    var newuser={...user,profile_status:pro.status};     
}else{
    var newuser=user;    
}
  const token = generateToken(user.id);
  res.json({ status:"success",user:newuser, token });
};

exports.googleAuthVerify = async (req, res) => {
  const { googleId, name, email,avathar } = req.body;

  if (!googleId || !email || !name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
     let user = await findUserByGoogleId(googleId);

     if (!user) {
      const existingByEmail = await findUserByEmail(email);

       if (existingByEmail) {
        await updateUserGoogleId(existingByEmail.id, googleId);
        user = { ...existingByEmail, googleId };
      } else {
         user = await createUserWithGoogle({ name, email, googleId,avathar });
      }
    }

    const token = generateToken(user.id);
    res.json({ status: 'success', user, token });

  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ message: 'Server error during Google auth' });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const { userid } = req.params;
    if (!userid) return res.status(400).json({ message: 'User ID is required' });

    const profile = await getProfile(userid);
    if (!profile) {
      return res.json({ profile: {} }); // Empty object if not found
    }

    res.json({ profile });
  } catch (err) {
    console.error('getProfile Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
 

exports.getProfiles = async (req, res) => {
  try {
    const { subject, native_language, min_rate, max_rate } = req.query;

    const profiles = await getProfiles({
      subject,
      native_language,
      min_rate,
      max_rate,
    });

    res.json({ profiles: profiles || [] });
  } catch (err) {
    console.error('getProfiles Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
