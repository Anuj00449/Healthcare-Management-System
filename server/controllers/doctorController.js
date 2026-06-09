
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// ================= GET ALL DOCTORS (PUBLIC) =================
exports.getDoctors = async (req, res) => {
  try {
    const { specialization, hospital, fees, minExperience } = req.query;

    // 🔥 ONLY APPROVED + NOT BLOCKED DOCTORS SHOULD BE PUBLIC
    const filter = {
      approvalStatus: "approved",
      isBlocked: false,
    };

    if (specialization) {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    if (hospital) {
      filter.hospital = { $regex: hospital, $options: "i" };
    }

    if (fees) {
      filter.fees = Number(fees);
    }

    if (minExperience) {
      filter.experience = { $gte: Number(minExperience) };
    }

    const doctors = await Doctor.find(filter).populate(
      "userId",
      "name email role",
    );

    return res.json(doctors);
  } catch (error) {
    console.error("getDoctors error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ================= GET SINGLE DOCTOR =================
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.json(doctor);
  } catch (error) {
    console.error("getDoctorById error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ================= UPLOAD DOCTOR IMAGE =================
exports.uploadDoctorImage = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
      "base64",
    )}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "medibook_doctors",
    });

    doctor.profileImage = result.secure_url;
    await doctor.save();

    return res.json({
      message: "Profile image uploaded successfully",
      profileImage: doctor.profileImage,
    });
  } catch (error) {
    console.error("uploadDoctorImage error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ================= ADD REVIEW =================
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const patient = await User.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const alreadyReviewed = doctor.reviews.find(
      (r) => r.patientId.toString() === req.user.id,
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You already reviewed this doctor",
      });
    }

    doctor.reviews.push({
      patientId: req.user.id,
      patientName: patient.name,
      rating: Number(rating),
      comment,
    });

    const total = doctor.reviews.reduce((sum, item) => sum + item.rating, 0);

    doctor.averageRating = total / doctor.reviews.length;

    await doctor.save();

    return res.json({
      message: "Review added successfully",
      reviews: doctor.reviews,
      averageRating: doctor.averageRating,
    });
  } catch (error) {
    console.error("addReview error:", error);
    return res.status(500).json({ message: error.message });
  }
};
