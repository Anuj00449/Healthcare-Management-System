

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
  getMyProfile,
  updatePatientProfile,
  updateDoctorProfile,
  uploadProfileImage,
} = require('../controllers/profileController');

router.get('/me', auth, getMyProfile);
router.put('/patient', auth, updatePatientProfile);
router.put('/doctor', auth, updateDoctorProfile);
router.post('/upload-image', auth, upload.single('image'), uploadProfileImage);

module.exports = router;