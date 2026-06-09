import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
} from "lucide-react";

export default function DashboardLayout({ title, subtitle, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const avatarRef = useRef(null);

  const [showCamera, setShowCamera] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowCamera(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setPreviewOpen(false);
        setShowCamera(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleAvatarClick = () => {
    setShowCamera(true);
  };

  const handleAvatarDoubleClick = () => {
    if (userImage) {
      setPreviewOpen(true);
    }
  };

  const handleCameraClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
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
      setShowCamera(false);
    }
  };

  return (
    <>
      <div className="saas-shell">
        <aside className="saas-sidebar">
          <div className="saas-profile-card">
            <div className="saas-profile-top">
              <div
                className="saas-avatar-wrapper"
                ref={avatarRef}
                onClick={handleAvatarClick}
                onDoubleClick={handleAvatarDoubleClick}
                title="Click to show camera, double click to view full image"
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

                {showCamera && (
                  <button
                    type="button"
                    className="avatar-camera-btn"
                    onClick={handleCameraClick}
                    title="Change profile image"
                  >
                    <Camera size={16} />
                  </button>
                )}
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
         

          <div className="saas-content">{children}</div>
        </main>
      </div>

      <AnimatePresence>
        {previewOpen && userImage && (
          <motion.div
            className="image-preview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              className="image-preview-box"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="image-preview-close"
                onClick={() => setPreviewOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>

              <img
                src={userImage}
                alt={user?.name || "Preview"}
                className="image-preview-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


