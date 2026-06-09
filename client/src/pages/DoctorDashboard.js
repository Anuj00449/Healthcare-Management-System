import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { Link } from 'react-router-dom';

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

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [image, setImage] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [prescriptionForms, setPrescriptionForms] = useState({});

  const loadAppointments = async () => {
    try {
      const { data } = await API.get('/appointments/my');
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments');
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, { status });

      if (status === 'approved') {
        toast.success('Appointment approved');
      } else if (status === 'completed') {
        toast.success('Appointment completed');
      } else if (status === 'cancelled') {
        toast.success('Appointment cancelled');
      }

      loadAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      setUploadMessage('Please select an image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', image);

      const { data } = await API.post('/profile/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadMessage(data.message);
    } catch (error) {
      setUploadMessage('Image upload failed');
    }
  };

  const handlePrescriptionChange = (id, field, value) => {
    setPrescriptionForms((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const savePrescription = async (id) => {
    try {
      const payload = prescriptionForms[id] || {};
      await API.put(`/appointments/${id}/prescription`, payload);
      toast.success('Prescription saved successfully');
      loadAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save prescription');
    }
  };

  const pendingAppointments = appointments.filter((appt) => appt.status === 'booked');
  const approvedAppointments = appointments.filter((appt) => appt.status === 'approved');
  const completedAppointments = appointments.filter((appt) => appt.status === 'completed');
  const cancelledAppointments = appointments.filter((appt) => appt.status === 'cancelled');

  return (
    <DashboardLayout
      title="Doctor Dashboard"
      subtitle="Manage requests, consultations, and prescriptions with a clean professional workspace."
    >
      <motion.div
        className="container doctor-dashboard-page"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div className="grid" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Total Appointments</h3>
            <p>{appointments.length}</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Pending</h3>
            <p>{pendingAppointments.length}</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Approved</h3>
            <p>{approvedAppointments.length}</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Completed</h3>
            <p>{completedAppointments.length}</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Cancelled</h3>
            <p>{cancelledAppointments.length}</p>
          </motion.div>
        </motion.div>

        <motion.h3
          style={{ marginTop: '30px' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          Appointment Requests
        </motion.h3>

        {appointments.length > 0 ? (
          <motion.div className="grid" variants={containerVariants} initial="hidden" animate="visible">
            {appointments.map((appt) => (
              <motion.div className="card" key={appt._id} variants={itemVariants} whileHover={{ y: -5 }}>
                <h3>{appt.patientId?.name}</h3>
                <p><strong>Email:</strong> {appt.patientId?.email}</p>
                <p><strong>Date:</strong> {appt.date}</p>
                <p><strong>Time:</strong> {appt.time}</p>
                <p><strong>Status:</strong> {appt.status}</p>
                <p><strong>Reason:</strong> {appt.reason || 'Not provided'}</p>

                {appt.status === 'completed' ? (
                  <p style={{ marginTop: '12px', color: '#86efac', fontWeight: '700' }}>
                    ✅ Appointment has been successfully completed
                  </p>
                ) : appt.status === 'cancelled' ? (
                  <p style={{ marginTop: '12px', color: '#fca5a5', fontWeight: '700' }}>
                    ❌ Appointment has been cancelled
                  </p>
                ) : (
                  <div className="row">
                    <motion.button
                      className="btn small"
                      onClick={() => updateStatus(appt._id, 'approved')}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Approve
                    </motion.button>

                    <motion.button
                      className="btn danger small"
                      onClick={() => updateStatus(appt._id, 'cancelled')}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      className="btn small"
                      onClick={() => updateStatus(appt._id, 'completed')}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Completed
                    </motion.button>
                  </div>
                )}

                {appt.status === 'approved' && (
                  <div style={{ marginTop: '14px' }}>
                    <textarea
                      placeholder="Medicines"
                      rows="3"
                      value={prescriptionForms[appt._id]?.medicines || ''}
                      onChange={(e) => handlePrescriptionChange(appt._id, 'medicines', e.target.value)}
                    />

                    <textarea
                      placeholder="Instructions"
                      rows="3"
                      style={{ marginTop: '10px' }}
                      value={prescriptionForms[appt._id]?.instructions || ''}
                      onChange={(e) => handlePrescriptionChange(appt._id, 'instructions', e.target.value)}
                    />

                    <textarea
                      placeholder="Additional Notes"
                      rows="3"
                      style={{ marginTop: '10px' }}
                      value={prescriptionForms[appt._id]?.notes || ''}
                      onChange={(e) => handlePrescriptionChange(appt._id, 'notes', e.target.value)}
                    />

                    <motion.button
                      className="btn secondary"
                      style={{ marginTop: '10px' }}
                      onClick={() => savePrescription(appt._id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Save Prescription
                    </motion.button>
                  </div>
                )}

                {appt.status === 'approved' && appt.videoRoom && (
                  <Link to={`/video-call/${appt.videoRoom}`} className="btn secondary" style={{ marginTop: '10px' }}>
                    Join Video Call
                  </Link>
                )}

                {appt.status === 'completed' && appt.prescription?.medicines && (
                  <p style={{ color: '#86efac' }}>
                    Prescription added
                  </p>
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

