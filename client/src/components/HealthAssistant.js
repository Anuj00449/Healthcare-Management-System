import React, { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../api";
import {
  LayoutDashboard,
  CalendarDays,
  Shield,
  LogOut,
  Video,
  FileText,
  Stethoscope,
  Home,
  Edit,
  Camera,
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
} from "lucide-react";

const APP_KNOWLEDGE = [
  {
    keywords: ["book", "appointment", "booking"],
    answer:
      "You can book an appointment from the Doctors page by selecting a doctor, choosing a slot, and confirming the booking.",
  },
  {
    keywords: ["doctor", "find doctor", "search doctor"],
    answer:
      "Use the Doctors page to search and filter doctors by specialization, hospital, fees, and experience.",
  },
  {
    keywords: ["video", "video call", "consultation"],
    answer:
      "When an appointment is approved, the Join Video Call option becomes available for consultation.",
  },
  {
    keywords: ["prescription", "pdf", "download"],
    answer:
      "After consultation completion, doctors can add medicines and instructions, and patients can download the prescription as a PDF.",
  },
  {
    keywords: ["patient dashboard", "patient"],
    answer:
      "The Patient Dashboard lets you manage appointments, prescriptions, and profile details in one place.",
  },
  {
    keywords: ["doctor dashboard"],
    answer:
      "The Doctor Dashboard helps manage appointment requests, profile details, consultations, and prescriptions.",
  },
  {
    keywords: ["admin", "admin dashboard"],
    answer:
      "The Admin Dashboard is used to manage platform activity and monitor doctors, patients, and appointments.",
  },
  {
    keywords: ["profile", "image", "photo"],
    answer:
      "Click the profile image in the sidebar to update it instantly. The sidebar image updates after upload.",
  },
  {
    keywords: ["medical record", "report", "scan"],
    answer:
      "Patients can upload medical records like reports, scans, and prescriptions, and doctors can view them when allowed.",
  },
  {
    keywords: ["login", "register", "signup"],
    answer:
      "Users can register from the Register page and sign in through the Login page.",
  },
  {
    keywords: ["slot", "time slot"],
    answer:
      "Available time slots are shown while booking, and already booked slots are disabled.",
  },
];

const DEFAULT_REPLY =
  "I can help with doctors, appointments, profiles, prescriptions, video calls, dashboards, and medical records. Try asking: How do I book an appointment?";

function getBotReply(message) {
  const text = message.toLowerCase();

  for (const item of APP_KNOWLEDGE) {
    if (item.keywords.some((keyword) => text.includes(keyword))) {
      return item.answer;
    }
  }

  if (text.includes("hi") || text.includes("hello")) {
    return "Hello! I’m your healthcare assistant. Ask me anything about this booking app.";
  }

  return DEFAULT_REPLY;
}

export default function DashboardLayout({ title, subtitle, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I’m your healthcare assistant. Ask me about appointments, doctors, prescriptions, profiles, dashboards, or records.",
    },
  ]);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("doctorProfile");
    navigate("/login");
  };

  const isPatient = user?.role === "patient";
  const isDoctor = user?.role === "doctor";
  const isAdmin = user?.role === "admin";

  const profilePath = isPatient
    ? "/patient-profile"
    : isDoctor
    ? "/doctor-profile-settings"
    : "/admin-dashboard";

  const patientLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/patient-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/doctors", label: "Find Doctors", icon: Stethoscope },
  ];

  const doctorLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/doctor-dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const adminLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/admin-dashboard", label: "Dashboard", icon: Shield },
  ];

  let links = [];
  if (isPatient) links = patientLinks;
  if (isDoctor) links = doctorLinks;
  if (isAdmin) links = adminLinks;

  const userImage = user?.profileImage || "";
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await API.post("/profile/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const existingUser = JSON.parse(localStorage.getItem("user") || "null");

      if (existingUser) {
        const updatedUser = {
          ...existingUser,
          profileImage: data?.profileImage || "",
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      toast.success("Profile image updated");
      window.location.reload();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Image upload failed");
    } finally {
      e.target.value = "";
    }
  };

  const sendAssistantMessage = (textToSend) => {
    const finalText = (textToSend ?? assistantInput).trim();
    if (!finalText) return;

    const userMessage = { sender: "user", text: finalText };
    const botMessage = { sender: "bot", text: getBotReply(finalText) };

    setAssistantMessages((prev) => [...prev, userMessage, botMessage]);
    setAssistantInput("");

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleAssistantSubmit = (e) => {
    e.preventDefault();
    sendAssistantMessage();
  };

  return (
    <div className="saas-shell">
      <aside className="saas-sidebar">
        <div className="saas-profile-card">
          <div className="saas-profile-top">
            <div
              className="saas-avatar-wrapper"
              onClick={handleImageClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleImageClick();
              }}
              title="Change profile image"
            >
              {userImage ? (
                <img
                  src={userImage}
                  alt={user?.name || "User"}
                  className="saas-profile-avatar-img"
                />
              ) : (
                <div className="saas-profile-avatar">{userInitial}</div>
              )}

              <div className="avatar-overlay">
                <Camera size={18} />
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            <div className="saas-profile-info">
              <h3>{user?.name || "User"}</h3>
              <p>{user?.email || "No email"}</p>
              <span className="saas-role-badge">
                {isPatient ? "Patient" : isDoctor ? "Doctor" : "Admin"}
              </span>
            </div>
          </div>

          {!isAdmin && (
            <Link to={profilePath} className="saas-edit-profile-btn">
              <Edit size={16} />
              <span>
                {isDoctor ? "Edit Doctor Profile" : "Edit Patient Profile"}
              </span>
            </Link>
          )}
        </div>

        <nav className="saas-nav">
          {links.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`saas-nav-link ${active ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="saas-sidebar-bottom">
          <button className="saas-logout-btn" onClick={logout} type="button">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="saas-main">
        <motion.div
          className="saas-topbar card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="saas-page-title">{title}</h1>
            {subtitle ? <p className="saas-page-subtitle">{subtitle}</p> : null}
          </div>

          <div className="saas-topbar-actions">
            <span className="info-chip">
              <Video size={14} />
              Online Care
            </span>
            <span className="info-chip">
              <FileText size={14} />
              Digital Records
            </span>
            <span className="info-chip">
              <CalendarDays size={14} />
              Smart Schedule
            </span>
          </div>
        </motion.div>

        <div className="saas-content">{children}</div>
      </main>

      <div className="health-assistant">
        {assistantOpen && (
          <div className="health-assistant-panel">
            <div className="health-assistant-header">
              <div className="health-assistant-title">
                <div className="assistant-icon-wrap">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4>Health Assistant</h4>
                  <p>Ask anything about this app</p>
                </div>
              </div>

              <button
                className="assistant-close-btn"
                onClick={() => setAssistantOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="health-assistant-body">
              <div className="health-assistant-messages">
                {assistantMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`assistant-message-row ${
                      msg.sender === "user" ? "user-row" : "bot-row"
                    }`}
                  >
                    <div className="assistant-avatar">
                      {msg.sender === "user" ? (
                        <User size={14} />
                      ) : (
                        <Bot size={14} />
                      )}
                    </div>
                    <div
                      className={`assistant-message ${
                        msg.sender === "user" ? "user-message" : "bot-message"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form
                className="health-assistant-form"
                onSubmit={handleAssistantSubmit}
              >
                <input
                  type="text"
                  placeholder="Ask about booking, doctors, prescriptions..."
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                />
                <button type="submit" className="assistant-send-btn">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

        <button
          className="health-assistant-toggle"
          onClick={() => setAssistantOpen((prev) => !prev)}
          type="button"
          aria-label="Open healthcare assistant"
        >
          <MessageCircle size={22} />
        </button>
      </div>
    </div>
  );
}