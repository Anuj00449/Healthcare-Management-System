
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import BookAppointmentInline from "./BookAppointmentInline";

import {
  BadgeCheck,
  Building2,
  CircleDollarSign,
  GraduationCap,
  MessageSquareText,
  ShieldCheck,
  Star,
  Stethoscope,
  TimerReset,
  UserRound,
  CalendarCheck,
  ArrowLeft,
} from "lucide-react";

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [doctor, setDoctor] = useState(null);
  const [showBooking, setShowBooking] = useState(false);

  const [form, setForm] = useState({
    rating: "",
    comment: "",
  });

  const [message, setMessage] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchDoctor = async () => {
    try {
      const { data } = await API.get(`/doctors/${id}`);
      setDoctor(data);
    } catch (error) {
      console.error("Failed to load doctor");
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const handleBookClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "patient") {
      setMessage("Only patients can book appointments");
      return;
    }

    setShowBooking(true);

    setTimeout(() => {
      document.querySelector(".booking-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setReviewLoading(true);
      setMessage("");

      await API.post(`/doctors/${id}/review`, form);

      setMessage("Review submitted successfully");
      setForm({ rating: "", comment: "" });
      fetchDoctor();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  if (!doctor) return <div className="container">Loading...</div>;

  return (
    <div className="container doctor-profile-page">

      {/* 🔥 TOP BAR */}
      <div className="profile-topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        <h2 className="profile-title">Doctor Profile</h2>
      </div>

      {/* ================= CARD ================= */}
      <div className="card doctor-profile-card">
        <div className="doctor-profile-image-wrap">
          <img
            src={
              doctor.profileImage ||
              "https://via.placeholder.com/400x240?text=Doctor+Image"
            }
            alt={doctor.userId?.name}
            className="doctor-image"
          />

          <span className="doctor-profile-badge">
            <ShieldCheck size={14} />
            Verified
          </span>
        </div>

        <div className="doctor-profile-info">
          <div className="doctor-profile-header">
            <div>
              <h2>{doctor.userId?.name}</h2>
              <p className="doctor-profile-subtitle">
                Professional doctor profile and consultation details
              </p>
            </div>

            <div className="doctor-profile-rating">
              <Star size={16} />
              <span>{doctor.averageRating?.toFixed(1) || "0.0"}</span>
            </div>
          </div>

          <div className="doctor-profile-meta-grid">
            <Meta icon={<Stethoscope size={16} />} label="Specialization" value={doctor.specialization} />
            <Meta icon={<GraduationCap size={16} />} label="Qualification" value={doctor.qualification} />
            <Meta icon={<TimerReset size={16} />} label="Experience" value={`${doctor.experience} years`} />
            <Meta icon={<Building2 size={16} />} label="Hospital" value={doctor.hospital} />
            <Meta icon={<CircleDollarSign size={16} />} label="Fees" value={`₹${doctor.fees}`} />
            <Meta icon={<BadgeCheck size={16} />} label="Rating" value={`${doctor.averageRating?.toFixed(1) || "0.0"} / 5`} />
          </div>

          <div className="doctor-profile-actions">
            <button type="button" className="btn" onClick={handleBookClick}>
              <CalendarCheck size={18} style={{ marginRight: "8px" }} />
              Book Appointment
            </button>
          </div>

          {message && <p className="review-message">{message}</p>}
        </div>
      </div>

      {/* ================= BOOKING ================= */}
      {showBooking && (
        <div className="booking-section">
          <BookAppointmentInline doctorId={id} doctor={doctor} />
        </div>
      )}

      {/* ================= REVIEW FORM ================= */}
      {user?.role === "patient" && (
        <form className="form doctor-review-form" onSubmit={handleSubmit}>
          <h3>Add Review</h3>

          <input
            type="number"
            min="1"
            max="5"
            name="rating"
            placeholder="Rating (1-5)"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            required
            disabled={reviewLoading}
          />

          <textarea
            name="comment"
            placeholder="Write your review"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            rows="4"
            disabled={reviewLoading}
          />

          <button className="btn" type="submit" disabled={reviewLoading}>
            {reviewLoading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {/* ================= REVIEWS ================= */}
      <div className="doctor-reviews-section">
        <h3>Reviews</h3>

        <div className="doctor-reviews-grid">
          {doctor.reviews?.length > 0 ? (
            doctor.reviews.map((review) => (
              <div className="card doctor-review-card" key={review._id}>
                <div className="doctor-review-card-top">
                  <strong>{review.patientName}</strong>
                  <span>
                    <Star size={13} /> {review.rating}
                  </span>
                </div>
                <p>{review.comment}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* 🔥 SMALL COMPONENT */
function Meta({ icon, label, value }) {
  return (
    <div className="doctor-meta-item">
      <span className="doctor-meta-icon">{icon}</span>
      <div>
        <small>{label}</small>
        <p>{value}</p>
      </div>
    </div>
  );
}