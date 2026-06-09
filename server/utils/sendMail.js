

// const nodemailer = require('nodemailer');

// // ✅ Create ONE reusable transporter (IMPORTANT FIX)
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT || 587),
//   secure: false, // STARTTLS
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
//   connectionTimeout: 10000,
// });

// // 🔐 Optional: verify SMTP on startup
// const verifyMailer = async () => {
//   try {
//     if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
//       console.warn("⚠️ SMTP credentials missing");
//       return;
//     }

//     await transporter.verify();
//     console.log("✅ Mail server is ready");
//   } catch (err) {
//     console.error("❌ Mail server error:", err.message);
//   }
// };

// // 📩 Send mail function
// const sendMail = async ({ to, subject, html }) => {
//   try {
//     if (!to || !subject || !html) {
//       throw new Error("Missing email fields");
//     }

//     const info = await transporter.sendMail({
//       from: `"${process.env.APP_NAME || 'MediBook'}" <${process.env.SMTP_USER}>`,
//       to,
//       subject,
//       html,
//     });

//     console.log("✅ Email sent:", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("❌ Email send failed:", error.message);
//     throw error;
//   }
// };

// module.exports = { sendMail, verifyMailer };


const nodemailer = require("nodemailer");

// ✅ Create ONE reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // STARTTLS

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // MUST be Gmail App Password
  },

  // 🔥 CRITICAL FIX FOR RENDER (IPv6 issue)
  family: 4,

  tls: {
    rejectUnauthorized: false,
  },

  connectionTimeout: 10000,
});

// 🔐 Optional SMTP verify (safe in production)
const verifyMailer = async () => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ SMTP credentials missing");
      return;
    }

    await transporter.verify();
    console.log("✅ Mail server is ready");
  } catch (err) {
    console.log("⚠️ Mail verify skipped (production safe)");
  }
};

// 📩 Send mail function (SAFE VERSION)
const sendMail = async ({ to, subject, html }) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("Missing email fields");
    }

    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || "MediBook"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (error) {
    // ❗ IMPORTANT: DO NOT crash API if email fails
    console.error("❌ Email send failed:", error.message);
    return null;
  }
};

module.exports = { sendMail, verifyMailer };