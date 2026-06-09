const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const sendMail = require('../utils/sendMail');
exports.getAdminStats = async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const approvedDoctors = await Doctor.countDocuments({ approvalStatus: 'approved' });
    const pendingDoctors = await Doctor.countDocuments({ approvalStatus: 'pending' });
    const rejectedDoctors = await Doctor.countDocuments({ approvalStatus: 'rejected' });
    const totalAppointments = await Appointment.countDocuments();

    res.json({
      totalUsers,
      totalDoctors,
      approvedDoctors,
      pendingDoctors,
      rejectedDoctors,
      totalAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (_req, res) => {
  try {
    const notApprovedDoctors = await Doctor.find({
      approvalStatus: { $ne: 'approved' },
    }).select('userId');

    const hiddenDoctorUserIds = notApprovedDoctors.map((doctor) => doctor.userId);

    const users = await User.find({
      _id: { $nin: hiddenDoctorUserIds },
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllDoctors = async (_req, res) => {
  try {
    const doctors = await Doctor.find({
      approvalStatus: 'approved',
    })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingDoctors = async (_req, res) => {
  try {
    const doctors = await Doctor.find({
      approvalStatus: 'pending',
    })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).populate('userId', 'name email role');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.approvalStatus = 'approved';
    doctor.isBlocked = false;

    await doctor.save();

    try {
      await sendMail({
        to: doctor.userId.email,
        subject: 'MediBook - Doctor Registration Approved',
        html: `
          <h2>Hello Dr. ${doctor.userId.name},</h2>
          <p>Congratulations! Your doctor registration has been approved by the admin.</p>
          <p>You can now login to MediBook and start managing your appointments.</p>
          <br />
          <p>Regards,<br/>MediBook Admin Team</p>
        `,
      });
    } catch (emailError) {
      console.error('Approval email failed:', emailError.message);
    }

    res.json({
      message: 'Doctor approved successfully',
      doctor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).populate('userId', 'name email role');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.approvalStatus = 'rejected';
    doctor.isBlocked = true;

    await doctor.save();

    try {
      await sendMail({
        to: doctor.userId.email,
        subject: 'MediBook - Doctor Registration Rejected',
        html: `
          <h2>Hello Dr. ${doctor.userId.name},</h2>
          <p>Your doctor registration has been rejected by the admin.</p>
          <p>Please contact MediBook support for more information.</p>
          <br />
          <p>Regards,<br/>MediBook Admin Team</p>
        `,
      });
    } catch (emailError) {
      console.error('Rejection email failed:', emailError.message);
    }

    res.json({
      message: 'Doctor rejected successfully',
      doctor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAppointments = async (_req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email role')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email role' },
      })
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin cannot be deleted' });
    }

    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });

      if (doctor) {
        await Appointment.deleteMany({ doctorId: doctor._id });
        await Doctor.findByIdAndDelete(doctor._id);
      }
    }

    if (user.role === 'patient') {
      await Appointment.deleteMany({ patientId: user._id });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await Appointment.findByIdAndDelete(id);

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleDoctorBlock = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).populate('userId', 'name email role');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.isBlocked = !doctor.isBlocked;
    await doctor.save();

    res.json({
      message: doctor.isBlocked
        ? 'Doctor blocked successfully'
        : 'Doctor unblocked successfully',
      doctor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



