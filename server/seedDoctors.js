const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const User = require('./models/User');
const Doctor = require('./models/Doctor');

dotenv.config();

const doctorsData = [
  {
    name: 'Dr. Priya Sharma',
    email: 'priya@example.com',
    password: '123456',
    specialization: 'Dentist',
    qualification: 'BDS, MDS',
    experience: 5,
    fees: 500,
    hospital: 'Apollo',
    slots: ['10:00 AM', '11:00 AM']
  },
  {
    name: 'Dr. Rahul Verma',
    email: 'rahul@example.com',
    password: '123456',
    specialization: 'Cardiologist',
    qualification: 'MBBS, MD',
    experience: 8,
    fees: 800,
    hospital: 'Fortis',
    slots: ['12:00 PM', '2:00 PM']
  },
  {
    name: 'Dr. Sneha Gupta',
    email: 'sneha@example.com',
    password: '123456',
    specialization: 'Dermatologist',
    qualification: 'MBBS, DDVL',
    experience: 4,
    fees: 400,
    hospital: 'Max Hospital',
    slots: ['9:00 AM', '10:30 AM']
  },
  {
    name: 'Dr. Amit Singh',
    email: 'amit@example.com',
    password: '123456',
    specialization: 'Orthopedic',
    qualification: 'MBBS, MS Ortho',
    experience: 6,
    fees: 600,
    hospital: 'Apollo',
    slots: ['3:00 PM', '5:00 PM']
  },
  {
    name: 'Dr. Neha Kapoor',
    email: 'neha@example.com',
    password: '123456',
    specialization: 'Gynecologist',
    qualification: 'MBBS, MD',
    experience: 7,
    fees: 700,
    hospital: 'AIIMS',
    slots: ['11:00 AM', '1:00 PM']
  }
];

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    for (let doc of doctorsData) {
      const existingUser = await User.findOne({ email: doc.email });

      if (existingUser) {
        console.log(`Skipping ${doc.email} (already exists)`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(doc.password, 10);

      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: hashedPassword,
        role: 'doctor'
      });

      await Doctor.create({
        userId: user._id,
        specialization: doc.specialization,
        qualification: doc.qualification,
        experience: doc.experience,
        fees: doc.fees,
        hospital: doc.hospital,
        availableSlots: doc.slots
      });

      console.log(`Added ${doc.name}`);
    }

    console.log('✅ All doctors seeded');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedDoctors();