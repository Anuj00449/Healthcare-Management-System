
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Stethoscope,
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("doctorProfile");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const dashboardPath =
    user?.role === "patient"
      ? "/patient-dashboard"
      : user?.role === "doctor"
      ? "/doctor-dashboard"
      : user?.role === "admin"
      ? "/admin-dashboard"
      : "/";

  return (
    <motion.nav
      className="nav"
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* LOGO */}
      <Link to="/" className="nav-brand">
        <div className="nav-brand-icon">
          <HeartPulse size={16} />
        </div>
        <div className="nav-brand-text">
          <span className="brand-title">MediBook</span>
          <span className="brand-subtitle">Healthcare</span>
        </div>
      </Link>

      {/* LINKS */}
      <div className="nav-links">
        <motion.div whileHover={{ y: -2 }}>
          <Link className={isActive("/") ? "nav-link active" : "nav-link"} to="/">
            Home
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -2 }}>
          <Link
            className={isActive("/doctors") ? "nav-link active" : "nav-link"}
            to="/doctors"
          >
            <Stethoscope size={14} />
            Doctors
          </Link>
        </motion.div>

        {user && (
          <motion.div whileHover={{ y: -2 }}>
            <Link
              className={
                location.pathname === dashboardPath
                  ? "nav-link active"
                  : "nav-link"
              }
              to={dashboardPath}
            >
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
          </motion.div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="nav-actions">
        {!user ? (
          <>
            <Link to="/login" className="nav-link nav-login">
              Admin 
            </Link>

            <Link to="/register" className="nav-cta">
              Get Started
            </Link>
          </>
        ) : (
          <>
            <div className="nav-user">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <motion.button
              onClick={logout}
              className="nav-logout"
              whileHover={{ y: -2 }}
            >
              <LogOut size={14} />
            </motion.button>
          </>
        )}
      </div>
    </motion.nav>
  );
}