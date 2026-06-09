import React, { useEffect, useMemo, useState } from "react";
import API from "../api";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  Clock3,
  Phone,
  User,
  Mail,
  IndianRupee,
  CreditCard,
} from "lucide-react";

export default function BookAppointmentInline({ doctorId, doctor }) {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    date: "",
    time: "",
    fullName: "",
    age: "",
    mobile: "",
    gender: "",
    email: "",
    reason: "",
  });

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!form.date) return;

      try {
        setLoadingSlots(true);
        setMessage("");

        const { data } = await API.get(
          `/appointments/booked-slots/${doctorId}/${form.date}`
        );

        setBookedSlots(data);
      } catch (error) {
        console.error("Failed to load booked slots", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [form.date, doctorId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.date || !form.time) {
      setMessage("Please select date and time slot");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded");
      setMessage("Razorpay SDK not loaded. Add Razorpay script in index.html.");
      return;
    }

    try {
      setBookingLoading(true);
      setMessage("");

      const { data } = await API.post("/payments/create-order", {
        doctorId,
      });

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency || "INR",
        name: "MediBook",
        description: `Consultation with Dr. ${doctor.userId?.name || "Doctor"}`,
        order_id: data.order.id,

        handler: async function (response) {
          try {
            const verifyRes = await API.post("/payments/verify", {
              doctorId,
              date: form.date,
              time: form.time,
              reason: form.reason || "General consultation",

              patientName: form.fullName,
              age: form.age,
              mobile: form.mobile,
              gender: form.gender,
              email: form.email,

              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success("Payment successful and appointment booked");
              setMessage("Payment successful and appointment booked");

              setForm({
                date: "",
                time: "",
                fullName: "",
                age: "",
                mobile: "",
                gender: "",
                email: "",
                reason: "",
              });
            } else {
              toast.error("Payment completed but booking failed");
              setMessage("Payment completed but booking failed");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            toast.error(
              err.response?.data?.message || "Payment verification failed"
            );
            setMessage(
              err.response?.data?.message || "Payment verification failed"
            );
          } finally {
            setBookingLoading(false);
          }
        },

        prefill: {
          name: form.fullName || storedUser?.name || "",
          email: form.email || storedUser?.email || "",
          contact: form.mobile || storedUser?.phone || "",
        },

        notes: {
          doctorId,
          doctorName: doctor.userId?.name || "",
          selectedDate: form.date,
          selectedTime: form.time,
          reason: form.reason || "General consultation",
        },

        theme: {
          color: "#047857",
        },

        modal: {
          ondismiss: function () {
            setBookingLoading(false);
            setMessage("Payment popup closed");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        setBookingLoading(false);
        toast.error(response.error?.description || "Payment failed");
        setMessage(response.error?.description || "Payment failed");
      });

      razorpay.open();
    } catch (error) {
      console.error("Create order error:", error);
      setBookingLoading(false);
      toast.error(error.response?.data?.message || "Failed to start payment");
      setMessage(error.response?.data?.message || "Failed to start payment");
    }
  };

  return (
    <form className="inline-booking-card" onSubmit={handleSubmit}>
      <h2 className="booking-title">
        <CalendarCheck size={24} />
        Book Your Appointment
      </h2>

      <div className="inline-booking-grid">
        <div className="booking-left">
          <h3>
            <CalendarCheck size={18} />
            Select Date
          </h3>

          <input
            type="date"
            name="date"
            min={today}
            value={form.date}
            onChange={handleChange}
            required
            disabled={bookingLoading}
          />

          <h3>
            <Clock3 size={18} />
            Available Time Slots
          </h3>

          <div className="inline-slots">
            {loadingSlots ? (
              <p>Loading slots...</p>
            ) : doctor.availableSlots?.length > 0 ? (
              doctor.availableSlots.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                const isSelected = form.time === slot;

                return (
                  <button
                    type="button"
                    key={slot}
                    disabled={isBooked || !form.date || bookingLoading}
                    onClick={() => setForm({ ...form, time: slot })}
                    className={`inline-slot-btn ${
                      isSelected ? "selected" : ""
                    } ${isBooked ? "booked" : ""}`}
                  >
                    <Clock3 size={14} />
                    {slot}
                  </button>
                );
              })
            ) : (
              <p>No slots available</p>
            )}
          </div>

          <div className="patient-details-card">
            <h3>Patient Details</h3>

            <div className="patient-grid">
              <div className="input-icon">
                <User size={16} />
                <input
                  name="fullName"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  disabled={bookingLoading}
                />
              </div>

              <input
                name="age"
                placeholder="Age"
                value={form.age}
                onChange={handleChange}
                required
                disabled={bookingLoading}
              />

              <div className="input-icon">
                <Phone size={16} />
                <input
                  name="mobile"
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                  disabled={bookingLoading}
                />
              </div>

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                disabled={bookingLoading}
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <div className="input-icon full">
                <Mail size={16} />
                <input
                  name="email"
                  placeholder="Email optional - for receipts"
                  value={form.email}
                  onChange={handleChange}
                  disabled={bookingLoading}
                />
              </div>

              <textarea
                className="full"
                name="reason"
                placeholder="Reason for visit"
                value={form.reason}
                onChange={handleChange}
                rows="3"
                disabled={bookingLoading}
              />
            </div>
          </div>
        </div>

        <div className="booking-summary-card">
          <p>
            <span>Selected Doctor:</span>
            <strong>Dr. {doctor.userId?.name}</strong>
          </p>

          <p>
            <span>Doctor Speciality:</span>
            <strong>{doctor.specialization}</strong>
          </p>

          <p>
            <span>Selected Date:</span>
            <strong>{form.date || "Not selected"}</strong>
          </p>

          <p>
            <span>Selected Time:</span>
            <strong>{form.time || "Not selected"}</strong>
          </p>

          <p>
            <span>Consultation Fee:</span>
            <strong className="fee">
              <IndianRupee size={16} />
              {doctor.fees}
            </strong>
          </p>

          <div className="online-payment-box">
            <CreditCard size={18} />
            <span>Online Payment Only</span>
          </div>

          <button
            className="btn confirm-booking-btn"
            type="submit"
            disabled={bookingLoading}
          >
            {bookingLoading ? "Processing Payment..." : `Pay ₹${doctor.fees} & Book`}
          </button>

          {message && <p className="booking-message">{message}</p>}
        </div>
      </div>
    </form>
  );
}