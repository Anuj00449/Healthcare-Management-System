
// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import API from '../api';
// import toast from 'react-hot-toast';

// export default function BookAppointment() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [doctor, setDoctor] = useState(null);
//   const [bookedSlots, setBookedSlots] = useState([]);
//   const [form, setForm] = useState({
//     date: '',
//     time: '',
//     reason: '',
//   });
//   const [message, setMessage] = useState('');
//   const [loadingSlots, setLoadingSlots] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);

//   useEffect(() => {
//     const fetchDoctor = async () => {
//       try {
//         const { data } = await API.get(`/doctors/${id}`);
//         setDoctor(data);
//       } catch (error) {
//         setMessage('Failed to load doctor');
//       }
//     };

//     fetchDoctor();
//   }, [id]);

//   useEffect(() => {
//     const fetchBookedSlots = async () => {
//       if (!form.date) return;

//       setLoadingSlots(true);
//       setMessage('');

//       try {
//         const { data } = await API.get(`/appointments/booked-slots/${id}/${form.date}`);
//         setBookedSlots(data);
//       } catch (error) {
//         console.error('Failed to fetch booked slots');
//       } finally {
//         setLoadingSlots(false);
//       }
//     };

//     fetchBookedSlots();
//   }, [form.date, id]);

//   const today = useMemo(() => {
//     return new Date().toISOString().split('T')[0];
//   }, []);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setMessage('');
//   };

//   const handleSlotSelect = (slot) => {
//     setForm((prev) => ({
//       ...prev,
//       time: slot,
//     }));
//   };

//   const getHourFromSlot = (slot) => {
//     const match = slot.match(/(\d+):(\d+)\s?(AM|PM)/i);
//     if (!match) return 0;

//     let hour = parseInt(match[1], 10);
//     const period = match[3].toUpperCase();

//     if (period === 'PM' && hour !== 12) hour += 12;
//     if (period === 'AM' && hour === 12) hour = 0;

//     return hour;
//   };

//   const groupedSlots = useMemo(() => {
//     if (!doctor?.availableSlots) {
//       return {
//         morning: [],
//         afternoon: [],
//         evening: [],
//       };
//     }

//     const groups = {
//       morning: [],
//       afternoon: [],
//       evening: [],
//     };

//     doctor.availableSlots.forEach((slot) => {
//       const hour = getHourFromSlot(slot);

//       if (hour < 12) {
//         groups.morning.push(slot);
//       } else if (hour < 17) {
//         groups.afternoon.push(slot);
//       } else {
//         groups.evening.push(slot);
//       }
//     });

//     return groups;
//   }, [doctor]);

//   const openRazorpayCheckout = async () => {
//     if (!doctor) {
//       toast.error('Doctor details not loaded');
//       return;
//     }

//     if (!form.date || !form.time) {
//       setMessage('Please select date and slot');
//       return;
//     }

//     try {
//       setBookingLoading(true);
//       setMessage('');


// const { data } = await API.post('/payments/create-order', {
//   doctorId: id,
// });
// console.log('Frontend Key:', data.key);
// console.log('Order ID:', data.order?.id);
//       const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

//       const options = {
//         key: data.key,
//         amount: data.order.amount,
//         currency: data.order.currency || 'INR',
//         name: 'Healthcare Booking App',
//         description: `Consultation with Dr. ${doctor.userId?.name || 'Doctor'}`,
//         order_id: data.order.id,
//         handler: async function (response) {
//           try {
//             // 2. Verify payment and create appointment
//             const verifyRes = await API.post('/payments/verify', {
//               doctorId: id,
//               date: form.date,
//               time: form.time,
//               reason: form.reason,
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//             });

//             if (verifyRes.data.success) {
//               toast.success('Payment successful and appointment booked');
//               setTimeout(() => navigate('/patient-dashboard'), 1000);
//             } else {
//               toast.error('Payment completed but booking failed');
//             }
//           } catch (err) {
//             console.error('Verification error:', err);
//             toast.error(err.response?.data?.message || 'Payment verification failed');
//           } finally {
//             setBookingLoading(false);
//           }
//         },
//         prefill: {
//           name: storedUser?.name || '',
//           email: storedUser?.email || '',
//           contact: storedUser?.phone || '',
//         },
//         notes: {
//           doctorId: id,
//           doctorName: doctor.userId?.name || '',
//           selectedDate: form.date,
//           selectedTime: form.time,
//           reason: form.reason || '',
//         },
//         theme: {
//           color: '#2563eb',
//         },
//         modal: {
//           ondismiss: function () {
//             setBookingLoading(false);
//             setMessage('Payment popup closed');
//           },
//         },
//       };

//       const razorpay = new window.Razorpay(options);

//       razorpay.on('payment.failed', function (response) {
//         console.error('Payment failed:', response.error);
//         setBookingLoading(false);
//         toast.error(response.error?.description || 'Payment failed');
//       });

//       razorpay.open();
//     } catch (err) {
//       console.error('Create order error:', err);
//       setBookingLoading(false);
//       toast.error(err.response?.data?.message || 'Failed to initiate payment');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.time) {
//       setMessage('Please select an available slot');
//       return;
//     }

//     if (!window.Razorpay) {
//       toast.error('Razorpay SDK not loaded. Add checkout script in public/index.html');
//       return;
//     }

//     await openRazorpayCheckout();
//   };

//   const renderSlotGroup = (title, slots) => {
//     if (!slots.length) return null;

//     return (
//       <div className="slot-group">
//         <h4 className="slot-group-title">{title}</h4>

//         <div className="slots-grid">
//           {slots.map((slot) => {
//             const isBooked = bookedSlots.includes(slot);
//             const isSelected = form.time === slot;

//             return (
//               <button
//                 type="button"
//                 key={slot}
//                 disabled={isBooked || !form.date || bookingLoading}
//                 className={`slot-btn ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`}
//                 onClick={() => !isBooked && handleSlotSelect(slot)}
//               >
//                 {slot}
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

//   if (!doctor) {
//     return (
//       <div className="container spinner-wrapper">
//         <div className="spinner"></div>
//         <p>Loading doctor details...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container form-page">
//       <form className="form booking-form" onSubmit={handleSubmit}>
//         <h2>Book Appointment</h2>

//         <div className="doctor-summary">
//           <p><strong>Doctor:</strong> {doctor.userId?.name}</p>
//           <p><strong>Hospital:</strong> {doctor.hospital}</p>
//           <p><strong>Fees:</strong> ₹{doctor.fees}</p>
//         </div>

//         <label>Select Date</label>
//         <input
//           type="date"
//           name="date"
//           min={today}
//           value={form.date}
//           onChange={handleChange}
//           required
//           disabled={bookingLoading}
//         />

//         <label>Choose a Slot</label>

//         {!form.date ? (
//           <p className="no-slots">Select a date to view available slots</p>
//         ) : loadingSlots ? (
//           <div className="spinner-wrapper compact-spinner">
//             <div className="spinner"></div>
//             <p>Loading slots...</p>
//           </div>
//         ) : (
//           <>
//             {renderSlotGroup('Morning', groupedSlots.morning)}
//             {renderSlotGroup('Afternoon', groupedSlots.afternoon)}
//             {renderSlotGroup('Evening', groupedSlots.evening)}

//             {doctor.availableSlots?.length > 0 &&
//               doctor.availableSlots.every((slot) => bookedSlots.includes(slot)) && (
//                 <p className="no-slots">No slots available for this date</p>
//               )}
//           </>
//         )}

//         <textarea
//           name="reason"
//           placeholder="Reason for visit"
//           value={form.reason}
//           onChange={handleChange}
//           rows="4"
//           disabled={bookingLoading}
//         />

//         <button
//           className="btn"
//           type="submit"
//           disabled={!form.date || !form.time || bookingLoading}
//         >
//           {bookingLoading ? 'Processing Payment...' : `Pay ₹${doctor.fees} & Book`}
//         </button>

//         {message && <p>{message}</p>}
//       </form>
//     </div>
//   );
// }