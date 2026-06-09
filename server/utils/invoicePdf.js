const PDFDocument = require("pdfkit");

function generateInvoiceBuffer({ appointment, patient, doctor, appName = "Healthcare Booking App" }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const invoiceNumber = `INV-${String(appointment._id).slice(-6).toUpperCase()}`;
      const issueDate = new Date().toLocaleString();
      const amount = appointment.consultationFee || 0;

      doc.fontSize(22).text(appName, { align: "center" });
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor("#666").text("Appointment Payment Invoice", {
        align: "center",
      });
      doc.fillColor("#000");
      doc.moveDown(1.5);

      doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`);
      doc.text(`Issued On: ${issueDate}`);
      doc.text(`Appointment ID: ${appointment._id}`);
      doc.text(`Payment ID: ${appointment.paymentId || "-"}`);
      doc.text(`Order ID: ${appointment.paymentOrderId || "-"}`);
      doc.moveDown();

      doc.fontSize(14).text("Patient Details", { underline: true });
      doc.moveDown(0.4);
      doc.fontSize(12).text(`Name: ${patient?.name || "-"}`);
      doc.text(`Email: ${patient?.email || "-"}`);
      doc.moveDown();

      doc.fontSize(14).text("Doctor Details", { underline: true });
      doc.moveDown(0.4);
      doc.fontSize(12).text(`Name: Dr. ${doctor?.name || "-"}`);
      doc.text(`Email: ${doctor?.email || "-"}`);
      doc.text(`Hospital: ${doctor?.hospital || "-"}`);
      doc.text(`Specialization: ${doctor?.specialization || "-"}`);
      doc.moveDown();

      doc.fontSize(14).text("Appointment Details", { underline: true });
      doc.moveDown(0.4);
      doc.fontSize(12).text(`Date: ${appointment.date}`);
      doc.text(`Time: ${appointment.time}`);
      doc.text(`Reason: ${appointment.reason || "Not provided"}`);
      doc.text(`Status: ${appointment.status}`);
      doc.text(`Payment Status: ${appointment.paymentStatus}`);
      doc.text(`Paid At: ${appointment.paidAt ? new Date(appointment.paidAt).toLocaleString() : "-"}`);
      doc.moveDown();

      doc.fontSize(14).text("Payment Summary", { underline: true });
      doc.moveDown(0.4);
      doc.fontSize(12).text(`Consultation Fee: ₹${amount}`);
      doc.text(`Currency: ${appointment.currency || "INR"}`);
      doc.text(`Total Paid: ₹${amount}`);
      doc.moveDown(2);

      doc.fontSize(10).fillColor("#666").text(
        "This is a system-generated invoice for the appointment booking.",
        { align: "center" }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateInvoiceBuffer };


        