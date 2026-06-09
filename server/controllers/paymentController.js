const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");
const { generateInvoiceBuffer } = require("../utils/invoicePdf");

exports.createOrder = async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    const doctor = await Doctor.findById(doctorId).populate(
      "userId",
      "name email",
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const amountInRupees = Number(doctor.fees) || 500;
    const amountInPaise = amountInRupees * 100;

    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation fee",
      });
    }

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        doctorId: String(doctor._id),
        userId: String(req.user.id),
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      amount: amountInRupees,
      currency: "INR",
      order,
      doctor,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.error?.description ||
        error.message ||
        "Failed to create Razorpay order",
    });
  }
};

exports.verifyPaymentAndCreateAppointment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      doctorId,
      date,
      time,
      reason,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !doctorId ||
      !date ||
      !time
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment or appointment details",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isAuthentic = generatedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const doctor = await Doctor.findById(doctorId).populate(
      "userId",
      "name email",
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const alreadyBooked = await Appointment.findOne({
      doctorId,
      date,
      time,
      paymentStatus: "paid",
      status: { $ne: "cancelled" },
    });

    if (alreadyBooked) {
      return res.status(409).json({
        success: false,
        message: "This slot is already booked",
      });
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      date,
      time,
      reason: reason || "",
      consultationFee: Number(doctor.fees) || 500,
      paymentStatus: "paid",
      paymentOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      paymentSignature: razorpay_signature,
      currency: "INR",
      paidAt: new Date(),
      status: "booked",
    });

    const patient = await User.findById(req.user.id).select("name email");

    const doctorInfo = {
      name: doctor.userId?.name || "Doctor",
      email: doctor.userId?.email || "",
      hospital: doctor.hospital || "",
      specialization: doctor.specialization || "",
    };

    console.log("✅ Appointment created");
    console.log("Patient email:", patient?.email);
    console.log("Doctor email:", doctorInfo.email);

    // ✅ SEND RESPONSE IMMEDIATELY (CRITICAL FIX)
    const responsePayload = {
      success: true,
      message: "Payment verified, appointment booked, and emails processed",
      appointment,
    };

    res.status(201).json(responsePayload);

    // ===============================
    // 🔥 BACKGROUND PROCESS (NO BLOCKING)
    // ===============================
    process.nextTick(async () => {
      let invoiceBuffer = null;

      try {
        invoiceBuffer = await generateInvoiceBuffer({
          appointment,
          patient,
          doctor: doctorInfo,
          appName: process.env.APP_NAME || "Healthcare Booking App",
          hospitalLogoPath: "assets/logo.png",
          doctorSignaturePath: "assets/signature.png",
        });
        console.log("✅ Invoice PDF generated");
      } catch (pdfError) {
        console.error("❌ Invoice PDF generation failed:", pdfError);
      }

      const attachments = invoiceBuffer
        ? [
            {
              filename: `invoice-${appointment._id}.pdf`,
              content: invoiceBuffer,
              contentType: "application/pdf",
            },
          ]
        : [];

      if (patient?.email) {
        try {
          console.log("📧 Sending patient email...");
          await sendMail({
            to: patient.email,
            subject: "Appointment Booked Successfully - Invoice Attached",
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2563eb;">Appointment Confirmed</h2>
                <p>Hello ${patient.name || "Patient"},</p>
                <p>Your appointment has been booked successfully.</p>

                <div style="background: #f8fafc; padding: 15px; border-radius: 10px;">
                  <p><strong>Doctor:</strong> Dr. ${doctorInfo.name}</p>
                  <p><strong>Date:</strong> ${date}</p>
                  <p><strong>Time:</strong> ${time}</p>
                  <p><strong>Reason:</strong> ${reason || "Not provided"}</p>
                  <p><strong>Amount Paid:</strong> ₹${Number(doctor.fees) || 500}</p>
                  <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                </div>

                <p style="margin-top: 20px;">Your invoice PDF is attached with this email.</p>
              </div>
            `,
            attachments,
          });
          console.log("✅ Patient email sent");
        } catch (mailError) {
          console.error("❌ Patient email failed:", mailError);
        }
      }

      if (doctorInfo.email) {
        try {
          console.log("📧 Sending doctor email...");
          await sendMail({
            to: doctorInfo.email,
            subject: "New Appointment Booked - Invoice Attached",
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #16a34a;">New Appointment Received</h2>
                <p>Hello Dr. ${doctorInfo.name},</p>
                <p>A new appointment has been booked and paid successfully.</p>

                <div style="background: #f8fafc; padding: 15px; border-radius: 10px;">
                  <p><strong>Patient:</strong> ${patient?.name || "Patient"}</p>
                  <p><strong>Patient Email:</strong> ${patient?.email || "N/A"}</p>
                  <p><strong>Date:</strong> ${date}</p>
                  <p><strong>Time:</strong> ${time}</p>
                  <p><strong>Reason:</strong> ${reason || "Not provided"}</p>
                  <p><strong>Consultation Fee:</strong> ₹${Number(doctor.fees) || 500}</p>
                  <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                </div>

                <p style="margin-top: 20px;">Invoice PDF is attached for reference.</p>
              </div>
            `,
            attachments,
          });
          console.log("✅ Doctor email sent");
        } catch (mailError) {
          console.error("❌ Doctor email failed:", mailError);
        }
      }
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.error?.description ||
        error.message ||
        "Payment verification failed on server",
    });
  }
};
