

const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPaymentAndCreateAppointment,
} = require("../controllers/paymentController");

const auth = require("../middleware/auth");

// 🔥 Rate limiting (prevents payment spam)
const rateLimit = require("express-rate-limit");

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // max 5 requests per minute
  message: "Too many payment requests, please try again later",
});

// 🔒 Role check (only patients should pay/book)
const roleCheck = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// ================= PAYMENT ROUTES =================

router.post(
  "/create-order",
  auth,
  roleCheck(["patient"]),
  paymentLimiter,
  createOrder
);

router.post(
  "/verify",
  auth,
  roleCheck(["patient"]),
  paymentLimiter,
  verifyPaymentAndCreateAppointment
);

module.exports = router;