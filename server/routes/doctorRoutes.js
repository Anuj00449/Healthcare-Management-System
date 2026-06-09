const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  getDoctors,
  getDoctorById,
  uploadDoctorImage,
  addReview,
} = require("../controllers/doctorController");

// ================= DOCTORS LIST =================
router.get("/", getDoctors);

// ================= IMAGE UPLOAD =================
router.post("/upload-image", auth, upload.single("image"), uploadDoctorImage);

// ================= REVIEWS (SPECIFIC ROUTE FIRST) =================
router.post("/:id/review", auth, addReview);

// ================= DOCTOR DETAILS =================
router.get("/:id", getDoctorById);

module.exports = router;
