const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");
const PatientProfile = require("../models/PatientProfile");
const Appointment = require("../models/Appointment");

// POST /api/admin/users — admin creates a doctor or admin account
async function createUser(req, res) {
  try {
    const { name, email, password, phone, role, specialization, qualifications, consultationFee } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password and role are required" });
    }
    if (!["doctor", "admin", "patient"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, phone, role });

    if (role === "doctor") {
      if (!specialization) {
        return res.status(400).json({ message: "specialization is required for doctors" });
      }
      await DoctorProfile.create({
        user: user._id,
        specialization,
        qualifications,
        consultationFee: consultationFee || 0,
      });
    } else if (role === "patient") {
      await PatientProfile.create({ user: user._id });
    }

    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/admin/doctors
async function listDoctors(req, res) {
  try {
    const doctors = await DoctorProfile.find().populate("user", "name email phone isActive").sort({ createdAt: -1 });
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/admin/patients
async function listPatients(req, res) {
  try {
    const patients = await PatientProfile.find().populate("user", "name email phone isActive").sort({ createdAt: -1 });
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/admin/appointments — every appointment in the system
async function listAllAppointments(req, res) {
  try {
    const appointments = await Appointment.find()
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .populate({ path: "patient", populate: { path: "user", select: "name" } })
      .sort({ date: -1, time: -1 });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createUser, listDoctors, listPatients, listAllAppointments };