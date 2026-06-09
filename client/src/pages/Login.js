import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api';
import toast from 'react-hot-toast';
import AIAssistant from "../components/AIAssistant";

export default function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post('/auth/login', form);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.doctorProfile) {
        localStorage.setItem('doctorProfile', JSON.stringify(data.doctorProfile));
      }

      toast.success('Login successful');

      if (data.user.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/patient-dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container form-page">
      <div className="back-home">
       <Link to="/" className="back-btn">
  <span>←</span>
  Back to Home
</Link>
      </div>

      <motion.form
        className="form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to continue managing your healthcare journey.</p>

        {error && <p className="error">{error}</p>}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <motion.button
          className="btn"
          type="submit"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Login
        </motion.button>
      </motion.form>

      <AIAssistant />
    </div>
  );
}