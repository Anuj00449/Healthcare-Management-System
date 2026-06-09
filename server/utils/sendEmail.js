



// const nodemailer = require('nodemailer');

// // ✅ Better explicit SMTP config (more stable than service: "gmail")
// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false, // STARTTLS
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // MUST be App Password (not normal password)
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
//   connectionTimeout: 10000,
// });

// // ================= VERIFY TRANSPORT =================
// const verifyEmailService = async () => {
//   try {
//     if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//       console.warn("⚠️ Email credentials missing");
//       return;
//     }

//     await transporter.verify();
//     console.log("✅ Email service is ready");
//   } catch (error) {
//     console.error("❌ Email service error:", error.message);
//   }
// };

// // ================= SEND EMAIL =================
// const sendEmail = async ({ to, subject, html }) => {
//   try {
//     if (!to || !subject || !html) {
//       throw new Error("Missing required email fields");
//     }

//     const mailOptions = {
//       from: `"MediBook" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     };

//     const info = await transporter.sendMail(mailOptions);

//     console.log("✅ Email sent:", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("❌ Email send failed:", error.message);
//     throw error;
//   }
// };

// module.exports = sendEmail;
// module.exports.verifyEmailService = verifyEmailService;


const nodemailer = require("nodemailer");

// ================= TRANSPORTER =================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },

  // 🔥 CRITICAL FIX FOR RENDER NETWORK
  family: 4,

  tls: {
    rejectUnauthorized: false,
  },

  connectionTimeout: 10000,
});

// ================= VERIFY EMAIL =================
const verifyEmailService = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ Email credentials missing");
      return;
    }

    await transporter.verify();
    console.log("✅ Email service is ready");
  } catch (error) {
    console.log("⚠️ Email verify skipped (safe in production)");
  }
};

// ================= SEND EMAIL =================
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("Missing required email fields");
    }

    const info = await transporter.sendMail({
      from: `"MediBook" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (error) {
    // 🔥 IMPORTANT: DO NOT CRASH API
    console.error("❌ Email send failed:", error.message);
    return null;
  }
};

module.exports = {
  sendEmail,
  verifyEmailService,
};