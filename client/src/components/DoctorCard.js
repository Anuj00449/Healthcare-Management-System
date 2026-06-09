
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BriefcaseBusiness, CalendarCheck } from "lucide-react";

export default function DoctorCard({ doctor }) {
  return (
    <motion.div
      className="doctor-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -4 }}
    >
      <div className="doctor-img">
        <img
          src={
            doctor.profileImage ||
            "https://via.placeholder.com/300x300?text=Doctor"
          }
          alt={doctor.userId?.name || "Doctor"}
        />
      </div>

      <h3 className="doctor-name">{doctor.userId?.name || "Doctor Name"}</h3>

      <p className="doctor-specialization">
        {doctor.specialization || "Specialist"}
      </p>

      <div className="doctor-exp">
        <BriefcaseBusiness size={15} />
        <span>{doctor.experience || 0} years Experience</span>
      </div>

      <Link to={`/doctor-profile/${doctor._id}`} className="book-btn">
        <CalendarCheck size={17} />
        <span>Book Now</span>
      </Link>
    </motion.div>
  );
}