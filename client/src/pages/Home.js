
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AIAssistant from "../components/AIAssistant";
import image from "../assets/medibook.jpg";
export default function Home() {
  return (
    <div className="container home-page">

      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >

        {/* LEFT */}
        <div className="hero-left">
          <div className="hero-badge">
            Smart Digital Healthcare Platform
          </div>

          <h1>
            Book Doctors, Consult Online, and Manage Healthcare in One Place
          </h1>

          <p>
            Discover trusted doctors, schedule appointments in seconds,
            access prescriptions, and experience a modern healthcare
            platform designed for convenience and simplicity.
          </p>

          {/* CTA */}
          <div className="hero-actions">
            <Link to="/doctors" className="btn primary">
              Find Doctors
            </Link>

            <Link to="/register" className="btn secondary">
              Get Started
            </Link>
          </div>

          {/* STATS */}
          <div className="hero-stats">
            <div className="stat-item">
              <h3>500+</h3>
              <span>Verified Doctors</span>
            </div>

            <div className="stat-item">
              <h3>10k+</h3>
              <span>Appointments</span>
            </div>

            <div className="stat-item">
              <h3>24/7</h3>
              <span>Support</span>
            </div>
          </div>
        </div>

       <div className="hero-right">
  <img
    src={image}
    alt="Healthcare"
  />
</div>

      </motion.section>

      <div className="hero-ai">
        <AIAssistant />
      </div>
    </div>
  );
}