import React, { useEffect, useState } from "react";
import API from "../api";
import toast from "react-hot-toast";
import DashboardLayout from "../components/DashboardLayout";


export default function PatientProfile() {
  const [profile, setProfile] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
    bloodGroup: "",
    medicalNotes: "",
  });

  const updateStoredUser = (updatedFields = {}) => {
    const existingUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!existingUser) return;

    const updatedUser = {
      ...existingUser,
      ...updatedFields,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setProfile(updatedUser);
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/profile/me");

      const user = data?.user || {};
      setProfile(user);

      localStorage.setItem("user", JSON.stringify(user));

      setForm({
        name: user.name || "",
        phone: user.phone || "",
        age: user.age || "",
        gender: user.gender || "",
        address: user.address || "",
        bloodGroup: user.bloodGroup || "",
        medicalNotes: user.medicalNotes || "",
      });

      setPreview(user.profileImage || "");
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);

      const { data } = await API.put("/profile/patient", form);

      updateStoredUser({
        name: data?.user?.name || form.name,
        phone: data?.user?.phone || form.phone,
        age: data?.user?.age || form.age,
        gender: data?.user?.gender || form.gender,
        address: data?.user?.address || form.address,
        bloodGroup: data?.user?.bloodGroup || form.bloodGroup,
        medicalNotes: data?.user?.medicalNotes || form.medicalNotes,
      });

      toast.success("Profile updated successfully");
      await loadProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("image", image);

      const { data } = await API.post("/profile/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      updateStoredUser({
        profileImage: data.profileImage,
      });

      setPreview(data.profileImage || "");
      setImage(null);

      toast.success("Image uploaded successfully");
      await loadProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Patient Profile"
        subtitle="Manage your personal information"
      >
        <div className="container spinner-wrapper">
          <div className="spinner"></div>
          <p>Loading patient profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Patient Profile"
      
    >
      <div className="container profile-page">
        <div className="profile-grid">
          

          <form className="form profile-card" onSubmit={handleUpdate}>
            <h3>Edit Patient Profile</h3>
             

            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              disabled={savingProfile}
            />

            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              disabled={savingProfile}
            />

            <input
              name="age"
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
              disabled={savingProfile}
            />

            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={savingProfile}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              disabled={savingProfile}
            />

            <input
              name="bloodGroup"
              placeholder="Blood Group"
              value={form.bloodGroup}
              onChange={handleChange}
              disabled={savingProfile}
            />

            <textarea
              name="medicalNotes"
              placeholder="Medical Notes"
              rows="5"
              value={form.medicalNotes}
              onChange={handleChange}
              disabled={savingProfile}
            />

            <button className="btn" type="submit" disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
             
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
