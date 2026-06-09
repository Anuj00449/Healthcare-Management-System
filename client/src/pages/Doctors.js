
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import API from '../api';
import DoctorCard from '../components/DoctorCard';
import AIAssistant from "../components/AIAssistant";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0 },
};

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/doctors');
      setDoctors(data);
    } catch (error) {
      console.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    const search = searchText.toLowerCase().trim();

    if (!search) return doctors;

    return doctors.filter((doctor) => {
      const name = doctor.userId?.name?.toLowerCase() || '';
      const specialization = doctor.specialization?.toLowerCase() || '';

      return name.includes(search) || specialization.includes(search);
    });
  }, [doctors, searchText]);

  return (
    <motion.div
      className="container doctors-page"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <section className="doctors-hero-panel">
        <div className="doctors-hero-title">
          <h1>Our Medical Experts</h1>
          <p>Find your ideal doctor by name or specialization</p>
        </div>

        <div className="doctor-search-panel">
          <div className="doctor-search-main">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search by doctor name or specialization..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="spinner-wrapper">
          <div className="spinner"></div>
          <p>Loading doctors...</p>
        </div>
      ) : filteredDoctors.length > 0 ? (
        <motion.div
          className="grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredDoctors.map((doctor) => (
            <motion.div key={doctor._id} variants={itemVariants}>
              <DoctorCard doctor={doctor} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          No doctors found.
        </motion.p>
      )}

      <AIAssistant />
    </motion.div>
  );
}
