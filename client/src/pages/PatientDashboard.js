import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import API from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { Link } from 'react-router-dom';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await API.get('/appointments/my');
        setAppointments(data);
      } catch (error) {
        console.error('Failed to load appointments');
      }
    };

    fetchAppointments();
  }, []);

  const upcomingAppointments = appointments.filter(
    (appt) => appt.status === 'booked' || appt.status === 'approved'
  );

  const completedAppointments = appointments.filter(
    (appt) => appt.status === 'completed'
  );

  const cancelledAppointments = appointments.filter(
    (appt) => appt.status === 'cancelled'
  );

  const paidAppointments = appointments.filter(
    (appt) => appt.paymentStatus === 'paid'
  );

  const pendingPayments = appointments.filter(
    (appt) => appt.paymentStatus === 'pending'
  );

  const monthlyVisitsData = useMemo(() => {
    const monthlyMap = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };

    appointments.forEach((appt) => {
      if (appt.date) {
        const monthIndex = new Date(appt.date).getMonth();
        const monthNames = Object.keys(monthlyMap);
        if (!Number.isNaN(monthIndex) && monthNames[monthIndex]) {
          monthlyMap[monthNames[monthIndex]] += 1;
        }
      }
    });

    return {
      labels: Object.keys(monthlyMap),
      datasets: [
        {
          label: 'Visits Per Month',
          data: Object.values(monthlyMap),
          borderWidth: 2,
        },
      ],
    };
  }, [appointments]);

  const healthTrendData = useMemo(() => {
    return {
      labels: ['Booked', 'Approved/Upcoming', 'Completed', 'Cancelled'],
      datasets: [
        {
          label: 'Appointment Trend',
          data: [
            appointments.filter((a) => a.status === 'booked').length,
            upcomingAppointments.length,
            completedAppointments.length,
            cancelledAppointments.length,
          ],
          borderWidth: 2,
          tension: 0.35,
        },
      ],
    };
  }, [appointments, upcomingAppointments, completedAppointments, cancelledAppointments]);

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      labels: {
        color: "#000000",
      },
    },

    title: {
      display: true,
      text: "Visits Per Month",
      color: "#000000",
    },
  },

  scales: {
    x: {
      ticks: {
        color: "#000000",
      },
      grid: {
        color: "rgba(0,0,0,0.08)",
      },
    },

    y: {
      ticks: {
        color: "#000000",
      },
      grid: {
        color: "rgba(0,0,0,0.08)",
      },
    },
  },
};

 const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      labels: {
        color: "#000000",
      },
    },

    title: {
      display: true,
      text: "Health Trends",
      color: "#000000",
    },
  },

  scales: {
    x: {
      ticks: {
        color: "#000000",
      },
      grid: {
        color: "rgba(0,0,0,0.08)",
      },
    },

    y: {
      ticks: {
        color: "#000000",
      },
      grid: {
        color: "rgba(0,0,0,0.08)",
      },
    },
  },
};


const downloadPrescription = (appt) => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header background
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(10, 10, 190, 28, 4, 4, "F");

  // Logo circle
  doc.setFillColor(37, 99, 235);
  doc.circle(24, 24, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("H", 21.5, 26.5);

  // Header text
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Healthcare Booking App", 38, 22);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Digital Medical Prescription", 38, 29);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PRESCRIPTION", 150, 22);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.text(`Date: ${appt.date || "N/A"}`, 150, 29);

  let y = 48;

  const drawSectionTitle = (title, top) => {
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(10, top, 190, 10, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(title, 15, top + 6.5);
  };

  const drawLabelValue = (label, value, x, top) => {
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, x, top);

    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "normal");
    doc.text(String(value || "N/A"), x + 28, top);
  };

  // Patient Details
  drawSectionTitle("Patient Details", y);
  y += 16;
  drawLabelValue("Name", appt.patientId?.name || "N/A", 15, y);
  drawLabelValue("Email", appt.patientId?.email || "N/A", 110, y);
  y += 12;

  // Doctor Details
  drawSectionTitle("Doctor Details", y);
  y += 16;
  drawLabelValue("Doctor", appt.doctorId?.userId?.name || "N/A", 15, y);
  drawLabelValue("Hospital", appt.doctorId?.hospital || "N/A", 110, y);
  y += 10;
  drawLabelValue("Specialist", appt.doctorId?.specialization || "N/A", 15, y);
  drawLabelValue("Time", appt.time || "N/A", 110, y);
  y += 14;

  // Medicines box
  drawSectionTitle("Medicines", y);
  y += 14;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(10, y, 190, 28, 3, 3, "F");
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    doc.splitTextToSize(appt.prescription?.medicines || "N/A", 178),
    15,
    y + 8
  );
  y += 36;

  // Instructions box
  drawSectionTitle("Instructions", y);
  y += 14;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(10, y, 190, 28, 3, 3, "F");
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    doc.splitTextToSize(appt.prescription?.instructions || "N/A", 178),
    15,
    y + 8
  );
  y += 36;

  // Notes box
  drawSectionTitle("Notes", y);
  y += 14;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(10, y, 190, 28, 3, 3, "F");
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    doc.splitTextToSize(appt.prescription?.notes || "N/A", 178),
    15,
    y + 8
  );
  y += 42;

  // Signature area
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(16);
  doc.text("Dr. Signature", 145, y);

  doc.setDrawColor(148, 163, 184);
  doc.line(135, y + 8, 190, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Authorized Doctor Signature", 138, y + 14);

  // Footer note
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "This is a digitally generated prescription. Please consult your doctor before making any medication changes.",
    pageWidth / 2,
    285,
    { align: "center", maxWidth: 180 }
  );

  doc.save(`prescription-${appt._id}.pdf`);
};
  const downloadInvoice = async (appt) => {
    try {
      setDownloadingInvoiceId(appt._id);

      const response = await API.get(`/appointments/${appt._id}/invoice`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${appt._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download invoice:', error);
    } finally {
      setDownloadingInvoiceId("");
    }
  };

  return (
    <DashboardLayout
      title="Patient Dashboard"
      subtitle="Track appointments, prescriptions, payments, and consultations in one premium healthcare workspace."
    >
      <motion.div
        className="container patient-dashboard-page"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Total Appointments</h3>
            <p>{appointments.length}</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Upcoming</h3>
            <p>{upcomingAppointments.length}</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Completed</h3>
            <p>{completedAppointments.length}</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Cancelled</h3>
            <p>{cancelledAppointments.length}</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Paid</h3>
            <p>{paidAppointments.length}</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Pending Payments</h3>
            <p>{pendingPayments.length}</p>
          </motion.div>
        </motion.div>

        <div className="analytics-grid" >
          <motion.div
            className="card analytics-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Bar data={monthlyVisitsData} options={barOptions} />
          </motion.div>

          <motion.div
            className="card analytics-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Line data={healthTrendData} options={lineOptions} />
          </motion.div>
        </div>

        <motion.h3
          style={{ marginTop: '30px' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          Appointment History
        </motion.h3>

        {appointments.length > 0 ? (
          <motion.div
            className="grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {appointments.map((appt) => (
              <motion.div
                className="card"
                key={appt._id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <h3>{appt.doctorId?.userId?.name}</h3>
                <p><strong>Date:</strong> {appt.date}</p>
                <p><strong>Time:</strong> {appt.time}</p>
                <p><strong>Status:</strong> {appt.status}</p>
                <p><strong>Reason:</strong> {appt.reason || 'Not provided'}</p>
                <p><strong>Hospital:</strong> {appt.doctorId?.hospital || 'N/A'}</p>
                <p><strong>Payment Status:</strong> {appt.paymentStatus || 'pending'}</p>
                <p><strong>Consultation Fee:</strong> ₹{appt.consultationFee || appt.doctorId?.fees || 0}</p>

                {appt.paymentId && (
                  <p><strong>Payment ID:</strong> {appt.paymentId}</p>
                )}

                {appt.status === 'approved' && appt.videoRoom && (
                  <Link
                    to={`/video-call/${appt.videoRoom}`}
                    className="btn secondary"
                    style={{ marginTop: '10px' }}
                  >
                    Join Video Call
                  </Link>
                )}

                {appt.paymentStatus === 'paid' && (
                  <button
                    className="btn secondary"
                    style={{ marginTop: '10px', marginRight: '10px' }}
                    onClick={() => downloadInvoice(appt)}
                    disabled={downloadingInvoiceId === appt._id}
                  >
                    {downloadingInvoiceId === appt._id
                      ? 'Downloading Invoice...'
                      : 'Download Invoice PDF'}
                  </button>
                )}

                {appt.status === 'completed' && appt.prescription?.medicines && (
                  <button
                    className="btn"
                    style={{ marginTop: '10px' }}
                    onClick={() => downloadPrescription(appt)}
                  >
                    Download Prescription PDF
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ marginTop: '16px' }}
          >
            No appointments found.
          </motion.p>
        )}
      </motion.div>
    </DashboardLayout>
  );
}