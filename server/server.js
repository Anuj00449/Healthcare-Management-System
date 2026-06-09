// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");

// const connectDB = require("./config/db");

// dotenv.config();
// connectDB();

// const app = express();
// app.set("trust proxy", 1);

// const { verifyMailer } = require("./utils/mailer");

// /* =========================
//    MAILER (NON-BLOCKING)
// ========================= */
// setTimeout(() => {
//   verifyMailer();
// }, 3000);

// /* =========================
//    SECURITY MIDDLEWARE
// ========================= */
// app.use(express.json({ limit: "10mb" })); // FIX: prevent payload abuse

// app.use(
//   cors({
//     origin: [process.env.CLIENT_URL].filter(Boolean),
//     credentials: true,
//   })
// );
// /* =========================
//    LOCAL CHATBOT HELPERS
// ========================= */
// function detectLanguage(message) {
//   const hasHindi = /[\u0900-\u097F]/.test(message);
//   const hasEnglish = /[a-zA-Z]/.test(message);

//   if (hasHindi && hasEnglish) return "hinglish";
//   if (hasHindi) return "hindi";
//   return "english";
// }

// function getLocalReply(text, language, userRole = "guest") {
//   const isHindiLike = language === "hindi" || language === "hinglish";

//   if (
//     text.includes("book") ||
//     text.includes("booking") ||
//     text.includes("appointment") ||
//     text.includes("अपॉइंटमेंट") ||
//     text.includes("बुक")
//   ) {
//     return isHindiLike
//       ? "Appointment book karne ke liye login karein, doctor select karein, available slot choose karein, aur confirm button par click karein."
//       : "To book an appointment, log in, select a doctor, choose an available slot, and confirm your booking.";
//   }

//   if (
//     text.includes("cancel") ||
//     text.includes("रद्द") ||
//     text.includes("cancel appointment")
//   ) {
//     return isHindiLike
//       ? "Appointment cancel karne ke liye dashboard me My Appointments section kholiye aur cancel option use kijiye."
//       : "To cancel an appointment, open the My Appointments section in your dashboard and use the cancel option.";
//   }

//   if (
//     text.includes("video") ||
//     text.includes("consultation") ||
//     text.includes("call") ||
//     text.includes("वीडियो")
//   ) {
//     return isHindiLike
//       ? "Doctor approval ke baad aap appointment section se video consultation join kar sakte hain."
//       : "After doctor approval, you can join the video consultation from your appointment section.";
//   }

//   if (
//     text.includes("prescription") ||
//     text.includes("medicine") ||
//     text.includes("medicines") ||
//     text.includes("दवा") ||
//     text.includes("प्रिस्क्रिप्शन")
//   ) {
//     return isHindiLike
//       ? "Consultation complete hone ke baad aap dashboard se prescription download kar sakte hain."
//       : "After the consultation is completed, you can download the prescription from your dashboard.";
//   }

//   return isHindiLike
//     ? "Main aapki help booking, doctors, appointments, video consultation, prescription, profile, aur dashboard se related kar sakta hoon."
//     : "I can help you with booking, doctors, appointments, video consultation, prescriptions, profile, and dashboard.";
// }

// /* =========================
//    ROUTES
// ========================= */
// app.get("/", (_req, res) => {
//   res.send("Healthcare Booking API running");
// });

// app.post("/api/ai/chat", async (req, res) => {
//   try {
//     const { message, userRole = "guest" } = req.body;

//     if (!message || !message.trim()) {
//       return res.status(400).json({ error: "Message is required" });
//     }

//     const language = detectLanguage(message);
//     const text = message.toLowerCase();
//     const reply = getLocalReply(text, language, userRole);

//     return res.json({
//       reply,
//       source: "local",
//     });
//   } catch (error) {
//     console.error("Local chatbot error:", error);
//     return res.status(500).json({
//       reply: "Something went wrong. Please try again.",
//       source: "local",
//     });
//   }
// });

// /* =========================
//    API ROUTES
// ========================= */
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/doctors", require("./routes/doctorRoutes"));
// app.use("/api/appointments", require("./routes/appointmentRoutes"));
// app.use("/api/admin", require("./routes/adminRoutes"));
// app.use("/api/profile", require("./routes/profileRoutes"));
// app.use("/api/payments", require("./routes/paymentRoutes"));

// /* =========================
//    GLOBAL ERROR HANDLER (IMPORTANT FIX)
// ========================= */
// app.use((err, _req, res, _next) => {
//   console.error("🔥 Server Error:", err.message);
//   res.status(500).json({
//     success: false,
//     message: "Internal Server Error",
//   });
// });

// /* =========================
//    START SERVER
// ========================= */
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

/* =========================
   TRUST PROXY (RENDER FIX)
========================= */
app.set("trust proxy", 1);

/* =========================
   EMAIL VERIFY (SAFE START)
========================= */
const { verifyMailer } = require("./utils/mailer");
setTimeout(() => {
  verifyMailer();
}, 3000);

/* =========================
   SECURITY MIDDLEWARE
========================= */
app.use(express.json({ limit: "10mb" }));

/* =========================
   CORS FIX (IMPORTANT)
========================= */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

/* =========================
   HEALTH CHECK ROUTE
========================= */
app.get("/", (_req, res) => {
  res.send("Healthcare Booking API running");
});

/* =========================
   CHATBOT ROUTE
========================= */
function detectLanguage(message) {
  const hasHindi = /[\u0900-\u097F]/.test(message);
  const hasEnglish = /[a-zA-Z]/.test(message);

  if (hasHindi && hasEnglish) return "hinglish";
  if (hasHindi) return "hindi";
  return "english";
}

function getLocalReply(text, language) {
  const isHindiLike = language !== "english";

  if (text.includes("book") || text.includes("appointment") || text.includes("बुक")) {
    return isHindiLike
      ? "Appointment book karne ke liye login karein aur doctor select karein."
      : "To book an appointment, login and select a doctor.";
  }

  if (text.includes("cancel")) {
    return isHindiLike
      ? "Dashboard me jaakar appointment cancel karein."
      : "Go to dashboard to cancel appointment.";
  }

  return isHindiLike
    ? "Main booking, doctors, appointments me help kar sakta hoon."
    : "I can help you with booking, doctors, and appointments.";
}

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message = "" } = req.body;

    if (!message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const language = detectLanguage(message);
    const reply = getLocalReply(message.toLowerCase(), language);

    res.json({ reply, source: "local" });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   ROUTES
========================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, _req, res, _next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});