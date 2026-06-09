const User = require("../models/User");
const Doctor = require("../models/Doctor");
const cloudinary = require("../config/cloudinary");

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let doctorProfile = null;

    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    res.json({
      user,
      doctorProfile,
    });
  } catch (error) {
    console.error("getMyProfile error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePatientProfile = async (req, res) => {
  try {
    const { name, phone, age, gender, address, bloodGroup, medicalNotes } =
      req.body;

    const user = await User.findById(req.user.id);

    if (!user || user.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }

    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.age = age ?? user.age;
    user.gender = gender ?? user.gender;
    user.address = address ?? user.address;
    user.bloodGroup = bloodGroup ?? user.bloodGroup;
    user.medicalNotes = medicalNotes ?? user.medicalNotes;

    await user.save();

    res.json({
      message: "Patient profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("updatePatientProfile error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      age,
      gender,
      address,
      specialization,
      qualification,
      experience,
      fees,
      hospital,
      availableSlots,
      bio,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user || user.role !== "doctor") {
      return res.status(404).json({ message: "Doctor user not found" });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    if (doctor.isBlocked || doctor.approvalStatus !== "approved") {
      return res.status(403).json({
        message: "Your account is not approved by admin",
      });
    }
    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.age = age ?? user.age;
    user.gender = gender ?? user.gender;
    user.address = address ?? user.address;

    await user.save();

    doctor.specialization = specialization ?? doctor.specialization;
    doctor.qualification = qualification ?? doctor.qualification;
    doctor.experience = experience ?? doctor.experience;
    doctor.fees = fees ?? doctor.fees;
    doctor.hospital = hospital ?? doctor.hospital;
    doctor.bio = bio ?? doctor.bio;

    if (availableSlots !== undefined) {
      doctor.availableSlots = Array.isArray(availableSlots)
        ? availableSlots
        : String(availableSlots)
            .split(",")
            .map((slot) => slot.trim())
            .filter(Boolean);
    }

    await doctor.save();

    res.json({
      message: "Doctor profile updated successfully",
      user,
      doctorProfile: doctor,
    });
  } catch (error) {
    console.error("updateDoctorProfile error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    if (!req.file.buffer) {
      return res.status(400).json({
        message:
          "File buffer not found. Use multer memoryStorage() in your route.",
      });
    }

    if (user.role === "doctor") {
      const doctorCheck = await Doctor.findOne({ userId: user._id });

      if (doctorCheck && doctorCheck.isBlocked) {
        return res
          .status(403)
          .json({ message: "Your account has been blocked by admin" });
      }
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Only JPG, JPEG, PNG, and WEBP images are allowed",
      });
    }

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "medibook_profiles",
      resource_type: "image",
    });

    user.profileImage = result.secure_url;
    await user.save();

    if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) {
        doctor.profileImage = result.secure_url;
        await doctor.save();
      }
    }

    res.json({
      message: "Profile image uploaded successfully",
      profileImage: result.secure_url,
    });
  } catch (error) {
    console.error("uploadProfileImage error:", error);
    res.status(500).json({
      message: error.message || "Image upload failed",
    });
  }
};
