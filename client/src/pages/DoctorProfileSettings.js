import React, { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';

export default function DoctorProfileSettings() {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    specialization: '',
    qualification: '',
    experience: '',
    fees: '',
    hospital: '',
    availableSlots: '',
    bio: '',
  });

  const updateStoredUser = (updatedFields = {}) => {
    const existingUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!existingUser) return;

    const updatedUser = {
      ...existingUser,
      ...updatedFields,
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/profile/me');

      setUser(data.user);
      setDoctor(data.doctorProfile);

      localStorage.setItem('user', JSON.stringify(data.user));

      setForm({
        name: data.user?.name || '',
        phone: data.user?.phone || '',
        age: data.user?.age || '',
        gender: data.user?.gender || '',
        address: data.user?.address || '',
        specialization: data.doctorProfile?.specialization || '',
        qualification: data.doctorProfile?.qualification || '',
        experience: data.doctorProfile?.experience || '',
        fees: data.doctorProfile?.fees || '',
        hospital: data.doctorProfile?.hospital || '',
        availableSlots: data.doctorProfile?.availableSlots?.join(', ') || '',
        bio: data.doctorProfile?.bio || '',
      });

      setPreview(data.user?.profileImage || '');
    } catch (error) {
      toast.error('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);

      const { data } = await API.put('/profile/doctor', form);

      updateStoredUser({
        name: data?.user?.name || form.name,
        phone: data?.user?.phone || form.phone,
        age: data?.user?.age || form.age,
        gender: data?.user?.gender || form.gender,
        address: data?.user?.address || form.address,
      });

      toast.success('Doctor profile updated successfully');
      loadProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error('Select image first');
      return;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append('image', image);

      const { data } = await API.post('/profile/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateStoredUser({
        profileImage: data.profileImage,
      });

      setPreview(data.profileImage || '');
      setImage(null);

      toast.success('Image uploaded');
      loadProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Doctor Profile" subtitle="Manage your profile">
        <div className="spinner-wrapper">
          <div className="spinner"></div>
          <p>Loading doctor profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Doctor Profile"
      subtitle="Update your professional information"
    >
      <div className="container profile-page">
        <div className="profile-grid">
         

          <form className="form profile-card" onSubmit={handleUpdate}>
            <h3>Edit Doctor Profile</h3>

            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
            <input name="age" value={form.age} onChange={handleChange} placeholder="Age" />

            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
            <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Specialization" />
            <input name="qualification" value={form.qualification} onChange={handleChange} placeholder="Qualification" />
            <input name="experience" value={form.experience} onChange={handleChange} placeholder="Experience" />
            <input name="fees" value={form.fees} onChange={handleChange} placeholder="Fees" />
            <input name="hospital" value={form.hospital} onChange={handleChange} placeholder="Hospital" />
            <input name="availableSlots" value={form.availableSlots} onChange={handleChange} placeholder="Slots" />

            <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" />

            <button className="btn" type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}