const Appointment = require("../models/Appointment");
const PatientProfile = require("../models/PatientProfile");
const DoctorProfile = require("../models/DoctorProfile");

// POST /api/appointments — patient books an appointment
async function createAppointment(req, res) {
  try {
    const { doctorId, date, time, reason } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "doctorId, date and time are required" });
    }

    const patientProfile = await PatientProfile.findOne({ user: req.user._id });
    if (!patientProfile) return res.status(404).json({ message: "Patient profile not found" });

    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appointment = await Appointment.create({
      patient: patientProfile._id,
      doctor: doctorId,
      date,
      time,
      reason,
    });

    res.status(201).json({ appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/appointments/mine — works for both patient and doctor, based on role
async function getMyAppointments(req, res) {
  try {
    let filter = {};

    if (req.user.role === "patient") {
      const patientProfile = await PatientProfile.findOne({ user: req.user._id });
      if (!patientProfile) return res.json({ appointments: [] });
      filter = { patient: patientProfile._id };
    } else if (req.user.role === "doctor") {
      const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
      if (!doctorProfile) return res.json({ appointments: [] });
      filter = { doctor: doctorProfile._id };
    }

    const appointments = await Appointment.find(filter)
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .populate({ path: "patient", populate: { path: "user", select: "name" } })
      .sort({ date: 1, time: 1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/appointments/:id — update status (cancel, confirm, complete)
async function updateAppointmentStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "cancelled", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createAppointment, getMyAppointments, updateAppointmentStatus };