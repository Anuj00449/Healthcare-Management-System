

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const {
  getAdminStats,
  getAllUsers,
  getAllDoctors,
  getAllAppointments,
  deleteUser,
  deleteAppointment,
  toggleDoctorBlock,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
} = require('../controllers/adminController');

// ================= ADMIN STATS =================
router.get('/stats', auth, adminAuth, getAdminStats);

// ================= USERS =================
router.get('/users', auth, adminAuth, getAllUsers);

// ================= DOCTORS (STATIC ROUTES FIRST) =================
router.get('/doctors/pending', auth, adminAuth, getPendingDoctors);

// ================= DOCTORS =================
router.get('/doctors', auth, adminAuth, getAllDoctors);

// ================= DOCTOR ACTIONS =================
router.put('/doctors/:id/approve', auth, adminAuth, approveDoctor);
router.put('/doctors/:id/reject', auth, adminAuth, rejectDoctor);
router.put('/doctors/:id/toggle-block', auth, adminAuth, toggleDoctorBlock);

// ================= APPOINTMENTS =================
router.get('/appointments', auth, adminAuth, getAllAppointments);

// ================= DELETE =================
router.delete('/users/:id', auth, adminAuth, deleteUser);
router.delete('/appointments/:id', auth, adminAuth, deleteAppointment);

module.exports = router;