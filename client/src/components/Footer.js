
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HeartPulse, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      className="footer premium-footer"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="footer-glow footer-glow-1"></div>
      <div className="footer-glow footer-glow-2"></div>

      <div className="footer-container">
        <motion.div
          className="footer-section footer-brand"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Link to="/" className="footer-logo-wrap footer-brand-link">
            <div className="footer-logo-icon">
              <HeartPulse size={18} />
            </div>
            <h3>MediBook</h3>
          </Link>

          <p>
            MediBook is a modern healthcare booking platform built to help
            patients connect with trusted doctors, manage appointments, and
            experience healthcare in a smarter and more seamless way.
          </p>
        </motion.div>

        <motion.div
          className="footer-section"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h4>Contact</h4>

          <ul className="footer-list footer-contact-list">
            <li>
              <a href="mailto:support@medibook.com" className="footer-contact-link">
                <span className="footer-contact-icon">
                  <Mail size={15} />
                </span>
                <span>support@medibook.com</span>
              </a>
            </li>

            <li>
              <a href="tel:+919876543210" className="footer-contact-link">
                <span className="footer-contact-icon">
                  <Phone size={15} />
                </span>
                <span>+91 9876543210</span>
              </a>
            </li>

            <li>
              <span className="footer-contact-link footer-contact-static">
                <span className="footer-contact-icon">
                  <MapPin size={15} />
                </span>
                <span>India</span>
              </span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          className="footer-section"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h4>Platform</h4>
          <ul className="footer-list">
            <li>Doctor Discovery</li>
            <li>Video Consultation</li>
            <li>Digital Prescriptions</li>
            <li>Secure Booking</li>
          </ul>
        </motion.div>

        <motion.div
          className="footer-section"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h4>Connect</h4>

          <div className="footer-socials">
            <motion.a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="social-icon"
              whileHover={{ y: -4, scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.5 0-.24-.01-1.03-.01-1.86-2.78.62-3.37-1.2-3.37-1.2-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.15-4.56-5.12 0-1.13.39-2.05 1.03-2.77-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.06A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.35 1.9-1.34 2.74-1.06 2.74-1.06.55 1.42.2 2.47.1 2.73.64.72 1.03 1.64 1.03 2.77 0 3.98-2.35 4.85-4.59 5.11.36.32.68.95.68 1.93 0 1.39-.01 2.51-.01 2.85 0 .28.18.61.69.5A10.24 10.24 0 0 0 22 12.23C22 6.58 17.52 2 12 2z" />
              </svg>
            </motion.a>

            <motion.a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              className="social-icon"
              whileHover={{ y: -4, scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3A1.97 1.97 0 1 0 5.3 6.94 1.97 1.97 0 0 0 5.25 3zM20.44 12.65c0-3.1-1.65-4.54-3.85-4.54-1.77 0-2.56.98-3 1.67V8.5h-3.38V20h3.38v-6.38c0-.34.02-.68.12-.92.27-.68.88-1.38 1.9-1.38 1.34 0 1.88 1.04 1.88 2.57V20H21v-7.35z" />
              </svg>
            </motion.a>

            <motion.a
              href="mailto:support@medibook.com"
              className="social-icon"
              whileHover={{ y: -4, scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              aria-label="Email"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 3.2-8 5.3-8-5.3V6l8 5.3L20 6v1.2z" />
              </svg>
            </motion.a>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="footer-bottom"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p>© {new Date().getFullYear()} MediBook. All rights reserved.</p>
        <p>Developed by Anuj Kumar</p>
      </motion.div>
    </motion.footer>
  );
}