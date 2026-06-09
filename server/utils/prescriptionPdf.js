const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generatePrescriptionBuffer({
  appointment,
  patient,
  doctor,
  appName = "Healthcare Booking App",
  hospitalLogoPath = "",
  doctorSignaturePath = "",
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const safeLogoPath =
        hospitalLogoPath && fs.existsSync(path.resolve(hospitalLogoPath))
          ? path.resolve(hospitalLogoPath)
          : null;

      const safeSignaturePath =
        doctorSignaturePath && fs.existsSync(path.resolve(doctorSignaturePath))
          ? path.resolve(doctorSignaturePath)
          : null;

      const issueDate = new Date().toLocaleString();

      // Header
      doc.roundedRect(40, 35, 515, 90, 12).fill("#eff6ff");

      if (safeLogoPath) {
        doc.image(safeLogoPath, 55, 50, {
          fit: [60, 60],
          align: "left",
          valign: "center",
        });
      } else {
        doc.circle(85, 78, 22).fill("#2563eb");
        doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(18).text("H", 78, 71);
      }

      doc.fillColor("#1e3a8a").font("Helvetica-Bold").fontSize(20).text(appName, 130, 52);
      doc.fillColor("#475569").font("Helvetica").fontSize(10).text("Digital Medical Prescription", 130, 78);

      doc.fillColor("#111827").font("Helvetica-Bold").fontSize(18).text("PRESCRIPTION", 390, 55, {
        width: 140,
        align: "right",
      });

      doc.font("Helvetica").fontSize(10).fillColor("#374151").text(`Issued On: ${issueDate}`, 380, 85, {
        width: 150,
        align: "right",
      });

      let y = 145;

      const sectionTitle = (title, top) => {
        doc.roundedRect(50, top, 495, 28, 6).fill("#2563eb");
        doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(12).text(title, 65, top + 8);
        doc.fillColor("#111827");
      };

      const writeLabelValue = (label, value, x, top, labelWidth = 90, valueWidth = 140) => {
        doc.fillColor("#374151").font("Helvetica-Bold").fontSize(10).text(label, x, top, { width: labelWidth });
        doc.fillColor("#111827").font("Helvetica").fontSize(10).text(value || "-", x + labelWidth, top, {
          width: valueWidth,
        });
      };

      sectionTitle("Patient Details", y);
      y += 42;
      writeLabelValue("Patient", patient?.name || "-", 60, y);
      writeLabelValue("Email", patient?.email || "-", 300, y, 60, 180);
      y += 24;

      sectionTitle("Doctor Details", y);
      y += 42;
      writeLabelValue("Doctor", `Dr. ${doctor?.name || "-"}`, 60, y);
      writeLabelValue("Email", doctor?.email || "-", 300, y, 60, 180);
      y += 20;
      writeLabelValue("Hospital", doctor?.hospital || "-", 60, y);
      writeLabelValue("Specialization", doctor?.specialization || "-", 300, y, 90, 150);
      y += 24;

      sectionTitle("Appointment Details", y);
      y += 42;
      writeLabelValue("Date", appointment?.date || "-", 60, y);
      writeLabelValue("Time", appointment?.time || "-", 300, y);
      y += 20;
      writeLabelValue("Reason", appointment?.reason || "Not provided", 60, y, 70, 390);
      y += 30;

      sectionTitle("Medicines", y);
      y += 38;
      doc.roundedRect(60, y, 475, 55, 8).fill("#f8fafc");
      doc.fillColor("#111827").font("Helvetica").fontSize(10).text(
        appointment?.prescription?.medicines || "N/A",
        72,
        y + 12,
        { width: 450 }
      );
      y += 70;

      sectionTitle("Instructions", y);
      y += 38;
      doc.roundedRect(60, y, 475, 55, 8).fill("#f8fafc");
      doc.fillColor("#111827").font("Helvetica").fontSize(10).text(
        appointment?.prescription?.instructions || "N/A",
        72,
        y + 12,
        { width: 450 }
      );
      y += 70;

      sectionTitle("Notes", y);
      y += 38;
      doc.roundedRect(60, y, 475, 55, 8).fill("#f8fafc");
      doc.fillColor("#111827").font("Helvetica").fontSize(10).text(
        appointment?.prescription?.notes || "N/A",
        72,
        y + 12,
        { width: 450 }
      );

      // Signature area
      const signY = 735;
      if (safeSignaturePath) {
        doc.image(safeSignaturePath, 390, signY - 28, {
          fit: [120, 40],
        });
      } else {
        doc.fillColor("#1f2937").font("Helvetica-Oblique").fontSize(16).text("Dr. Signature", 400, signY - 10);
      }

      doc.moveTo(390, signY + 15).lineTo(510, signY + 15).strokeColor("#94a3b8").stroke();
      doc.fillColor("#475569").font("Helvetica").fontSize(9).text("Authorized Doctor Signature", 380, signY + 22, {
        width: 140,
        align: "center",
      });

      doc.fillColor("#64748b").font("Helvetica").fontSize(8).text(
        `${appName} • This is a digitally generated prescription`,
        40,
        790,
        { width: 515, align: "center" }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePrescriptionBuffer };