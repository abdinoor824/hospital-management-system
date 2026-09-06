const User = require("../models/User");
const PatientProfile = require("../models/PatientProfile");
const DoctorProfile = require("../models/DoctorProfile");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");

// POST /api/walkin — doctor registers a patient physically and books+pays in one step
async function createWalkinAppointment(req, res) {
  try {
    const {
      name, email, password, phone,   // new patient's account info
      date, time, reason,             // appointment info
      amount,                          // cash amount collected at desk
    } = req.body;

    if (!name || !email || !password || !date || !time) {
      return res.status(400).json({ message: "name, email, password, date and time are required" });
    }

    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
    if (!doctorProfile) return res.status(404).json({ message: "Doctor profile not found" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "A patient with this email already exists" });

    const patientUser = await User.create({ name, email, password, phone, role: "patient" });
    const patientProfile = await PatientProfile.create({ user: patientUser._id });

    const appointment = await Appointment.create({
      patient: patientProfile._id,
      doctor: doctorProfile._id,
      date,
      time,
      reason,
      status: "confirmed", // walk-ins are already in front of the doctor, so skip "pending"
    });

    let payment = null;
    if (amount) {
      payment = await Payment.create({
        appointment: appointment._id,
        patient: patientProfile._id,
        amount,
        method: "cash",
        status: "paid",
        reference: "cash-at-desk",
        paidAt: new Date(),
      });
    }

    res.status(201).json({ appointment, payment, patient: { id: patientUser._id, name, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createWalkinAppointment };