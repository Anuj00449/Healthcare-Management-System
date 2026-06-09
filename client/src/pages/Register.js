
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api';
import toast from 'react-hot-toast';
import AIAssistant from "../components/AIAssistant";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    qualification: '',
    experience: '',
    fees: '',
    hospital: '',
    availableSlots: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
      };

      if (role === 'doctor') {
        payload.specialization = form.specialization;
        payload.qualification = form.qualification;
        payload.experience = form.experience;
        payload.fees = form.fees;
        payload.hospital = form.hospital;
        payload.availableSlots = form.availableSlots
          ? form.availableSlots.split(',').map((slot) => slot.trim())
          : [];
      }

      const { data } = await API.post('/auth/register', payload);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.doctorProfile) {
        localStorage.setItem('doctorProfile', JSON.stringify(data.doctorProfile));
      }

      toast.success('Account created successfully');

      if (data.user.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/patient-dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container form-page">

      <div className="back-home">
        <Link to="/" className="back-btn">← Back to Home</Link>
      </div>

      <motion.form
        className="form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 42, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2>Create Account</h2>

        {error && <p className="error">{error}</p>}

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />

        {role === 'doctor' && (
          <>
            <input name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} required />
            <input name="qualification" placeholder="Qualification" value={form.qualification} onChange={handleChange} required />
            <input name="experience" type="number" placeholder="Experience" value={form.experience} onChange={handleChange} required />
            <input name="fees" type="number" placeholder="Fees" value={form.fees} onChange={handleChange} required />
            <input name="hospital" placeholder="Hospital / Clinic" value={form.hospital} onChange={handleChange} required />
            <input name="availableSlots" placeholder="Available Slots" value={form.availableSlots} onChange={handleChange} />
          </>
        )}

        <motion.button className="btn" type="submit" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          Create Account
        </motion.button>

        {/* 🔥 LOGIN LINK */}
        <p className="form-switch">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </motion.form>

      <AIAssistant />
    </div>
  );
}