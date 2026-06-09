


const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const roleCheck = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

const {
  getMyAppointments,
  updateAppointmentStatus,
  getBookedSlots,
  addPrescription,
  downloadInvoice,
  downloadPrescription,
} = require("../controllers/appointmentController");

// ================= PATIENT / USER =================
router.get("/my", auth, getMyAppointments);

// ================= PUBLIC SLOT CHECK (NOW PROTECTED) =================
router.get("/booked-slots/:doctorId/:date", auth, getBookedSlots);

// ================= DOCTOR ACTIONS =================
router.put("/:id", auth, roleCheck(["doctor", "admin"]), updateAppointmentStatus);

router.put("/:id/prescription", auth, roleCheck(["doctor"]), addPrescription);

// ================= DOWNLOADS =================
router.get("/:id/invoice", auth, downloadInvoice);
router.get("/:id/prescription", auth, downloadPrescription);

module.exports = router;