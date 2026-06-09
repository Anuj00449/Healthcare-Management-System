

// // const nodemailer = require("nodemailer");

// // // 🔐 Create transporter with safer config
// // const transporter = nodemailer.createTransport({
// //   host: process.env.SMTP_HOST || "smtp.gmail.com",
// //   port: Number(process.env.SMTP_PORT || 587),
// //   secure: false, // TLS upgrade via STARTTLS
// //   auth: {
// //     user: process.env.SMTP_USER,
// //     pass: process.env.SMTP_PASS,
// //   },
// //   tls: {
// //     rejectUnauthorized: false,
// //   },
// //   connectionTimeout: 10000, // 10 sec timeout
// // });

// // // ================= VERIFY MAILER =================
// // async function verifyMailer() {
// //   try {
// //     if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
// //       console.warn("⚠️ SMTP credentials missing");
// //       return;
// //     }

// //     await transporter.verify();
// //     console.log("✅ Mail server is ready");
// //   } catch (error) {
// //     console.error("❌ Mail verify failed:", error.message);
// //   }
// // }

// // // ================= SEND MAIL =================
// // async function sendMail({ to, subject, html, attachments = [] }) {
// //   try {
// //     if (!to || !subject || !html) {
// //       throw new Error("Missing required email fields");
// //     }

// //     const info = await transporter.sendMail({
// //       from: `"${process.env.APP_NAME || "Healthcare Booking App"}" <${
// //         process.env.MAIL_FROM || process.env.SMTP_USER
// //       }>`,
// //       to,
// //       subject,
// //       html,
// //       attachments,
// //     });

// //     console.log("✅ Email sent:", info.messageId);
// //     return info;
// //   } catch (error) {
// //     console.error("❌ Email send failed:", error.message);
// //     throw error;
// //   }
// // }

// // module.exports = { sendMail, verifyMailer };

// const nodemailer = require("nodemailer");

// // 🔐 Create transporter (Render + Gmail safe)
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "smtp.gmail.com",
//   port: Number(process.env.SMTP_PORT || 587),
//   secure: false,

//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },

//   // 🔥 CRITICAL FIX FOR RENDER (IPv6 issue)
//   family: 4,

//   tls: {
//     rejectUnauthorized: false,
//   },

//   connectionTimeout: 10000,
// });

// // ================= VERIFY MAILER =================
// async function verifyMailer() {
//   try {
//     if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
//       console.warn("⚠️ SMTP credentials missing");
//       return;
//     }

//     await transporter.verify();
//     console.log("✅ Mail server is ready");
//   } catch (error) {
//     // ⚠️ Render sometimes blocks verify (safe to ignore)
//     console.log("⚠️ Mail verify skipped on production (normal)");
//   }
// }

// // ================= SEND MAIL =================
// async function sendMail({ to, subject, html, attachments = [] }) {
//   try {
//     if (!to || !subject || !html) {
//       throw new Error("Missing required email fields");
//     }

//     const info = await transporter.sendMail({
//       from: `"${process.env.APP_NAME || "Healthcare Booking App"}" <${
//         process.env.MAIL_FROM || process.env.SMTP_USER
//       }>`,
//       to,
//       subject,
//       html,
//       attachments,
//     });

//     console.log("✅ Email sent:", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("❌ Email send failed:", error.message);
//     throw error;
//   }
// }

// module.exports = { sendMail, verifyMailer };

const nodemailer = require("nodemailer");
const dns = require("dns");

// ✅ Force Node.js to prefer IPv4
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

const verifyMailer = async () => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ SMTP credentials missing");
      return;
    }

    await transporter.verify();
    console.log("✅ Mail server is ready");
  } catch (err) {
    console.log("⚠️ Mail verify skipped:", err.message);
  }
};

const sendMail = async ({ to, subject, html, attachments = [] }) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("Missing email fields");
    }

    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || "MediBook"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments,
    });

    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    return null;
  }
};

module.exports = { sendMail, verifyMailer };