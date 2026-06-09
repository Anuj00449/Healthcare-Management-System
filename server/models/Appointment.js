const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    medicines: {
      type: String,
      default: "",
    },
    instructions: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    prescribedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["booked", "approved", "cancelled", "completed"],
      default: "booked",
    },
    videoRoom: {
      type: String,
      default: "",
    },

    // Prescription details
    prescription: {
      type: prescriptionSchema,
      default: () => ({
        medicines: "",
        instructions: "",
        notes: "",
        prescribedAt: null,
      }),
    },

    // Payment details
    consultationFee: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentOrderId: {
      type: String,
      default: "",
    },
    paymentId: {
      type: String,
      default: "",
    },
    paymentSignature: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "INR",
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
