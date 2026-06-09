const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");
const { generateInvoiceBuffer } = require("../utils/invoicePdf");
const { generatePrescriptionBuffer } = require("../utils/prescriptionPdf");

exports.getMyAppointments = async (req, res) => {
  try {
    let appointments = [];

    if (req.user.role === "patient") {
      appointments = await Appointment.find({ patientId: req.user.id })
        .populate("patientId", "name email")
        .populate({
          path: "doctorId",
          populate: { path: "userId", select: "name email" },
        })
        .sort({ createdAt: -1 });
    }

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user.id });

      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      if (doctor.isBlocked) {
        return res
          .status(403)
          .json({ message: "Your account has been blocked by admin" });
      }

      appointments = await Appointment.find({ doctorId: doctor._id })
        .populate("patientId", "name email")
        .populate({
          path: "doctorId",
          populate: { path: "userId", select: "name email" },
        })
        .sort({ createdAt: -1 });
    }

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getBookedSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    const appointments = await Appointment.find({
      doctorId,
      date,
      status: { $ne: "cancelled" },
    });

    const bookedSlots = appointments.map((item) => item.time);

    return res.json(bookedSlots);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["approved", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "name email")
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (req.user.role === "doctor") {
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      if (doctor.isBlocked) {
        return res
          .status(403)
          .json({ message: "Your account has been blocked by admin" });
      }

      if (appointment.doctorId?._id.toString() !== doctor._id.toString()) {
        return res
          .status(403)
          .json({ message: "You can update only your own appointments" });
      }
    }

    if (status === "approved" && !appointment.videoRoom) {
      appointment.videoRoom = `medibook-${appointment._id}`;
    }

    appointment.status = status;
    await appointment.save();

    // 🔥 NON-BLOCKING EMAIL
    const patientEmail = appointment.patientId?.email;
    const patientName = appointment.patientId?.name;
    const doctorName = appointment.doctorId?.userId?.name;

    if (patientEmail) {
      let subject = "";
      let html = "";

      if (status === "approved") {
        subject = "MediBook - Appointment Approved";
        html = `
          <h2>Hello ${patientName},</h2>
          <p>Your appointment has been <strong>approved</strong>.</p>
          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p><strong>Date:</strong> ${appointment.date}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Video Room:</strong> ${appointment.videoRoom}</p>
        `;
      }

      if (status === "cancelled") {
        subject = "MediBook - Appointment Cancelled";
        html = `
          <h2>Hello ${patientName},</h2>
          <p>Your appointment has been <strong>cancelled</strong>.</p>
          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p><strong>Date:</strong> ${appointment.date}</p>
        `;
      }

      if (status === "completed") {
        subject = "MediBook - Appointment Completed";
        html = `
          <h2>Hello ${patientName},</h2>
          <p>Your appointment has been marked as <strong>completed</strong>.</p>
        `;
      }

      sendMail({
        to: patientEmail,
        subject,
        html,
      }).catch((err) => console.error("Status email error:", err.message));
    }

    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.addPrescription = async (req, res) => {
  try {
    const { medicines, instructions, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("patientId", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || doctor.isBlocked) {
      return res.status(403).json({ message: "Doctor not allowed" });
    }

    if (appointment.doctorId._id.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    appointment.prescription = {
      medicines: medicines || "",
      instructions: instructions || "",
      notes: notes || "",
      prescribedAt: new Date(),
    };

    appointment.status = "completed";
    await appointment.save();

    const patient = appointment.patientId;

    const doctorInfo = {
      name: appointment.doctorId?.userId?.name || "Doctor",
      email: appointment.doctorId?.userId?.email || "",
      hospital: appointment.doctorId?.hospital || "",
      specialization: appointment.doctorId?.specialization || "",
    };

    // // 🔥 NON-BLOCKING EMAIL + PDF
    // sendMail({
    //   to: patient.email,
    //   subject: "Prescription Added - Appointment Completed",
    //   html: `
    //     <h2>Prescription Ready</h2>
    //     <p>Doctor: ${doctorInfo.name}</p>
    //     <p>Hospital: ${doctorInfo.hospital}</p>
    //   `,
    //   attachments: [],
    // }).catch((err) => console.error("Prescription email error:", err.message));

    // return res.json({
    //   message: "Prescription added successfully",
    //   appointment,
    // });
    // Generate prescription PDF
const pdfBuffer = await generatePrescriptionBuffer({
  appointment,
  patient,
  doctor: doctorInfo,
  appName: process.env.APP_NAME || "Healthcare Booking App",
  hospitalLogoPath: "assets/logo.png",
  doctorSignaturePath: "assets/signature.png",
});

// Send email with PDF attachment
sendMail({
  to: patient.email,
  subject: "Prescription Added - Appointment Completed",
  html: `
    <h2>Your Prescription is Ready</h2>
    <p><strong>Doctor:</strong> ${doctorInfo.name}</p>
    <p><strong>Hospital:</strong> ${doctorInfo.hospital}</p>

    <h3>Prescription Summary</h3>
    <p><strong>Medicines:</strong> ${medicines || "N/A"}</p>
    <p><strong>Instructions:</strong> ${instructions || "N/A"}</p>
    <p><strong>Notes:</strong> ${notes || "N/A"}</p>

    <p>The full prescription PDF is attached to this email.</p>
  `,
  attachments: [
    {
      filename: `prescription-${appointment._id}.pdf`,
      content: pdfBuffer,
    },
  ],
}).catch((err) =>
  console.error("Prescription email error:", err.message)
);
return res.json({
  message: "Prescription added successfully",
  appointment,
});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const patient = await User.findById(appointment.patientId).select(
      "name email",
    );
    const doctor = await Doctor.findById(appointment.doctorId).populate(
      "userId",
      "name email",
    );

    const invoiceBuffer = await generateInvoiceBuffer({
      appointment,
      patient,
      doctor: {
        name: doctor.userId?.name || "Doctor",
        email: doctor.userId?.email || "",
        hospital: doctor.hospital || "",
        specialization: doctor.specialization || "",
      },
      appName: process.env.APP_NAME || "Healthcare Booking App",
      hospitalLogoPath: "assets/logo.png",
      doctorSignaturePath: "assets/signature.png",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${appointment._id}.pdf`,
    );

    return res.send(invoiceBuffer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to download invoice" });
  }
};

exports.downloadPrescription = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "name email")
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      });

    if (!appointment?.prescription?.medicines) {
      return res.status(400).json({ message: "Prescription not available" });
    }

    const buffer = await generatePrescriptionBuffer({
      appointment,
      patient: appointment.patientId,
      doctor: {
        name: appointment.doctorId?.userId?.name || "Doctor",
        email: appointment.doctorId?.userId?.email || "",
        hospital: appointment.doctorId?.hospital || "",
        specialization: appointment.doctorId?.specialization || "",
      },
      appName: process.env.APP_NAME || "Healthcare Booking App",
      hospitalLogoPath: "assets/logo.png",
      doctorSignaturePath: "assets/signature.png",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=prescription-${appointment._id}.pdf`,
    );

    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to download prescription" });
  }
};
