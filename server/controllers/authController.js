const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const sendEmail = require("../utils/sendEmail");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      specialization,
      qualification,
      experience,
      fees,
      hospital,
      availableSlots,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    if (role === "admin") {
      return res
        .status(403)
        .json({ message: "Admin cannot be registered from public form" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const finalRole = role || "patient";
    const hashedPassword = await bcrypt.hash(password, 10);

    if (finalRole === "doctor") {
      if (
        !specialization ||
        !qualification ||
        !experience ||
        !fees ||
        !hospital
      ) {
        return res.status(400).json({
          message:
            "Doctor details are required: specialization, qualification, experience, fees, hospital",
        });
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: finalRole,
    });

    let doctorProfile = null;

    if (user.role === "doctor") {
      doctorProfile = await Doctor.create({
        userId: user._id,
        specialization,
        qualification,
        experience: Number(experience),
        fees: Number(fees),
        hospital,
        availableSlots: Array.isArray(availableSlots) ? availableSlots : [],
        approvalStatus: "pending",
        isBlocked: false,
      });
    }

    const subject =
      user.role === "doctor"
        ? "MediBook - Doctor Registration Submitted"
        : "Welcome to MediBook - Registration Successful";

    const html =
      user.role === "doctor"
        ? `
          <h2>Welcome to MediBook, Dr. ${user.name}!</h2>
          <p>Your doctor registration has been submitted successfully.</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p><strong>Specialization:</strong> ${specialization}</p>
          <p><strong>Hospital:</strong> ${hospital}</p>
          <p><strong>Status:</strong> Pending admin approval</p>
          <p>You will be able to login after admin approval.</p>
        `
        : `
          <h2>Welcome to MediBook, ${user.name}!</h2>
          <p>Your patient account has been created successfully.</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p>You can now log in and book appointments easily.</p>
        `;

    // ✅ FIXED: non-blocking email (IMPORTANT)
    sendEmail({
      to: user.email,
      subject,
      html,
    }).catch((emailError) => {
      console.error("Email send error:", emailError.message);
    });

    if (user.role === "doctor") {
      return res.status(201).json({
        message: "Doctor registration submitted. Waiting for admin approval.",
        user,
        doctorProfile,
      });
    }

    const token = generateToken(user);

    res.status(201).json({
      message: `${user.role} registered successfully`,
      token,
      user,
      doctorProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    let doctorProfile = null;

    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ userId: user._id });

      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      if (doctorProfile.approvalStatus === "pending") {
        return res.status(403).json({
          message: "Your doctor account is waiting for admin approval.",
        });
      }

      if (doctorProfile.approvalStatus === "rejected") {
        return res.status(403).json({
          message: "Your doctor registration has been rejected by admin.",
        });
      }

      if (doctorProfile.isBlocked) {
        return res.status(403).json({
          message: "Your doctor account has been blocked by admin.",
        });
      }
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user,
      doctorProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
