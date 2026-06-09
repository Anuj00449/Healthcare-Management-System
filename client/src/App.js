import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors";
import BookAppointment from "./pages/BookAppointment";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorProfile from "./pages/DoctorProfile";
import PatientProfile from "./pages/PatientProfile";
import DoctorProfileSettings from "./pages/DoctorProfileSettings";
import VideoConsultation from "./pages/VideoConsultation";

function AppContent() {
  const location = useLocation();

  // 🔥 FIXED: use startsWith for dynamic routes
  const hideNavbarRoutes = [
    "/login",
    "/register",
    "/patient-dashboard",
    "/doctor-dashboard",
    "/admin-dashboard",
    "/patient-profile",
    "/doctor-profile-settings",
    "/doctor-profile", // 🔥 IMPORTANT
  ];

  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    location.pathname.startsWith(route),
  );

  return (
    <>
      {/* NAVBAR */}
      {!shouldHideNavbar && <Navbar />}

      {/* TOASTER */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctor-profile/:id" element={<DoctorProfile />} />

        <Route
          path="/book/:id"
          element={
            <ProtectedRoute>
              <BookAppointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient-profile"
          element={
            <ProtectedRoute>
              <PatientProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-profile-settings"
          element={
            <ProtectedRoute>
              <DoctorProfileSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/video-call/:roomId"
          element={
            <ProtectedRoute>
              <VideoConsultation />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* FOOTER */}
      {!shouldHideNavbar && <Footer />}
    </>
  );
}

export default AppContent;
