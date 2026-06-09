import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../api';
import DashboardLayout from '../components/DashboardLayout';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingDoctors: 0,
    approvedDoctors: 0,
    rejectedDoctors: 0,
  });

  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    try {
      const [
        statsRes,
        usersRes,
        doctorsRes,
        appointmentsRes,
        pendingDoctorsRes,
      ] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/doctors'),
        API.get('/admin/appointments'),
        API.get('/admin/doctors/pending'),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setDoctors(doctorsRes.data);
      setAppointments(appointmentsRes.data);
      setPendingDoctors(pendingDoctorsRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApproveDoctor = async (doctorId) => {
    const confirmed = window.confirm('Are you sure you want to approve this doctor?');
    if (!confirmed) return;

    try {
      await API.put(`/admin/doctors/${doctorId}/approve`);
      toast.success('Doctor approved successfully');
      loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve doctor');
    }
  };

  const handleRejectDoctor = async (doctorId) => {
    const confirmed = window.confirm('Are you sure you want to reject this doctor?');
    if (!confirmed) return;

    try {
      await API.put(`/admin/doctors/${doctorId}/reject`);
      toast.success('Doctor rejected successfully');
      loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject doctor');
    }
  };

  const handleDeleteUser = async (id, role) => {
    if (role === 'admin') {
      toast.error('Admin cannot be deleted');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteAppointment = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this appointment?');
    if (!confirmed) return;

    try {
      await API.delete(`/admin/appointments/${id}`);
      toast.success('Appointment deleted successfully');
      loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete appointment');
    }
  };

  const handleToggleDoctorBlock = async (doctorId, isBlocked) => {
    try {
      await API.put(`/admin/doctors/${doctorId}/toggle-block`);
      toast.success(isBlocked ? 'Doctor unblocked successfully' : 'Doctor blocked successfully');
      loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update doctor status');
    }
  };

  const userRoleChartData = useMemo(() => {
    const patients = users.filter((u) => u.role === 'patient').length;
    const doctorsCount = users.filter((u) => u.role === 'doctor').length;
    const admins = users.filter((u) => u.role === 'admin').length;

    return {
      labels: ['Patients', 'Doctors', 'Admins'],
      datasets: [
        {
          label: 'User Roles',
          data: [patients, doctorsCount, admins],
          borderWidth: 1,
        },
      ],
    };
  }, [users]);

  const appointmentStatusChartData = useMemo(() => {
    const booked = appointments.filter((a) => a.status === 'booked').length;
    const approved = appointments.filter((a) => a.status === 'approved').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;

    return {
      labels: ['Booked', 'Approved', 'Completed', 'Cancelled'],
      datasets: [
        {
          label: 'Appointments',
          data: [booked, approved, completed, cancelled],
          borderWidth: 2,
        },
      ],
    };
  }, [appointments]);

  const monthlyAppointmentsChartData = useMemo(() => {
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
        const dateObj = new Date(appt.date);
        const monthIndex = dateObj.getMonth();
        const months = Object.keys(monthlyMap);

        if (!Number.isNaN(monthIndex) && months[monthIndex]) {
          monthlyMap[months[monthIndex]] += 1;
        }
      }
    });

    return {
      labels: Object.keys(monthlyMap),
      datasets: [
        {
          label: 'Appointments Per Month',
          data: Object.values(monthlyMap),
          borderWidth: 2,
          tension: 0.35,
        },
      ],
    };
  }, [appointments]);

  const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      labels: {
        color: '#000000',
        font: {
          size: 13,
          weight: '600',
        },
      },
    },
  },

  scales: {
    x: {
      ticks: {
        color: '#000000',
      },
      grid: {
        color: 'rgba(0,0,0,0.08)',
      },
    },

    y: {
      ticks: {
        color: '#000000',
      },
      grid: {
        color: 'rgba(0,0,0,0.08)',
      },
    },
  },
};

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Monitor users, doctors, appointments, and platform activity from one central control panel."
    >
      <motion.div
        className="container admin-dashboard-page"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {error && <p className="error">{error}</p>}

        <motion.div
          className="grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Total Doctors</h3>
            <p>{stats.totalDoctors}</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Total Appointments</h3>
            <p>{stats.totalAppointments}</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -6 }}>
            <h3>Pending Doctors</h3>
            <p>{stats.pendingDoctors || pendingDoctors.length}</p>
          </motion.div>
        </motion.div>

        <motion.h3 style={{ marginTop: '30px' }}>
          Pending Doctor Approvals
        </motion.h3>

        <motion.div className="grid" variants={containerVariants} initial="hidden" animate="visible">
          {pendingDoctors.length === 0 ? (
            <motion.div className="card" variants={itemVariants}>
              <p>No pending doctor registrations.</p>
            </motion.div>
          ) : (
            pendingDoctors.map((doctor) => (
              <motion.div className="card" key={doctor._id} variants={itemVariants} whileHover={{ y: -5 }}>
                {doctor.profileImage && (
                  <img
                    src={doctor.profileImage}
                    alt={doctor.userId?.name || 'Doctor'}
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '12px',
                    }}
                  />
                )}

                <p><strong>Name:</strong> {doctor.userId?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {doctor.userId?.email || 'N/A'}</p>
                <p><strong>Specialization:</strong> {doctor.specialization || 'N/A'}</p>
                <p><strong>Qualification:</strong> {doctor.qualification || 'N/A'}</p>
                <p><strong>Hospital:</strong> {doctor.hospital || 'N/A'}</p>
                <p><strong>Experience:</strong> {doctor.experience} years</p>
                <p><strong>Fees:</strong> ₹{doctor.fees}</p>
                <p><strong>Bio:</strong> {doctor.bio || 'N/A'}</p>
                <p><strong>Approval:</strong> {doctor.approvalStatus}</p>

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <button
                    className="btn"
                    onClick={() => handleApproveDoctor(doctor._id)}
                  >
                    Approve
                  </button>

                  <button
                    className="btn danger"
                    onClick={() => handleRejectDoctor(doctor._id)}
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        <h3 style={{ marginTop: '30px' }}>Analytics</h3>

        <div className="analytics-grid">
          <motion.div className="card analytics-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Bar
              data={userRoleChartData}
              options={{
                ...commonChartOptions,
                plugins: {
                  ...commonChartOptions.plugins,
                  title: {
                    display: true,
                    text: 'User Roles Overview',
                    color: '#ffffff',
                  },
                },
              }}
            />
          </motion.div>

          <motion.div className="card analytics-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Doughnut
  data={appointmentStatusChartData}
  options={{
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#000000',
          font: {
            size: 13,
            weight: '600',
          },
        },
      },

      title: {
        display: true,
        text: 'Appointment Status Distribution',
        color: '#000000',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  }}
/>
            
          </motion.div>
        </div>
        

        <div className="analytics-wide" >
          <motion.div className="card analytics-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <Line
              data={monthlyAppointmentsChartData}
              options={{
                ...commonChartOptions,
                plugins: {
                  ...commonChartOptions.plugins,
                  title: {
                    display: true,
                    text: 'Monthly Appointment Trends',
                    color: '#ffffff',
                  },
                },
              }}
            />
          </motion.div>
        </div>

        <motion.h3 style={{ marginTop: '30px' }}>
          All Users
        </motion.h3>

        <motion.div className="grid" variants={containerVariants} initial="hidden" animate="visible">
          {users.map((user) => (
            <motion.div className="card" key={user._id} variants={itemVariants} whileHover={{ y: -5 }}>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>

              {user.role !== 'admin' && (
                <button
                  className="btn danger"
                  style={{ marginTop: '10px' }}
                  onClick={() => handleDeleteUser(user._id, user.role)}
                >
                  Delete User
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.h3 style={{ marginTop: '30px' }}>
          All Doctors
        </motion.h3>

        <motion.div className="grid" variants={containerVariants} initial="hidden" animate="visible">
          {doctors.map((doctor) => (
            <motion.div className="card" key={doctor._id} variants={itemVariants} whileHover={{ y: -5 }}>
              <p><strong>Name:</strong> {doctor.userId?.name}</p>
              <p><strong>Email:</strong> {doctor.userId?.email}</p>
              <p><strong>Specialization:</strong> {doctor.specialization}</p>
              <p><strong>Hospital:</strong> {doctor.hospital}</p>
              <p><strong>Fees:</strong> ₹{doctor.fees}</p>
              <p><strong>Experience:</strong> {doctor.experience} years</p>
              <p><strong>Approval:</strong> {doctor.approvalStatus || 'approved'}</p>
              <p><strong>Status:</strong> {doctor.isBlocked ? 'Blocked' : 'Active'}</p>

              <button
                className={`btn ${doctor.isBlocked ? 'secondary' : 'danger'}`}
                style={{ marginTop: '10px' }}
                onClick={() => handleToggleDoctorBlock(doctor._id, doctor.isBlocked)}
              >
                {doctor.isBlocked ? 'Unblock Doctor' : 'Block Doctor'}
              </button>
            </motion.div>
          ))}
        </motion.div>

        <motion.h3 style={{ marginTop: '30px' }}>
          All Appointments
        </motion.h3>

        <motion.div className="grid" variants={containerVariants} initial="hidden" animate="visible">
          {appointments.map((appt) => (
            <motion.div className="card" key={appt._id} variants={itemVariants} whileHover={{ y: -5 }}>
              <p><strong>Patient:</strong> {appt.patientId?.name}</p>
              <p><strong>Doctor:</strong> {appt.doctorId?.userId?.name}</p>
              <p><strong>Date:</strong> {appt.date}</p>
              <p><strong>Time:</strong> {appt.time}</p>
              <p><strong>Status:</strong> {appt.status}</p>

              <button
                className="btn danger"
                style={{ marginTop: '10px' }}
                onClick={() => handleDeleteAppointment(appt._id)}
              >
                Delete Appointment
              </button>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
