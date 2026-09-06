const MedicalRecord = require("../models/MedicalRecord");
const PatientProfile = require("../models/PatientProfile");
const DoctorProfile = require("../models/DoctorProfile");
const Appointment = require("../models/Appointment");

// GET /api/records/mine — patient sees only their own records
async function getMyRecords(req, res) {
  try {
    const patientProfile = await PatientProfile.findOne({ user: req.user._id });
    if (!patientProfile) return res.json({ records: [] });

    const records = await MedicalRecord.find({ patient: patientProfile._id })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .sort({ createdAt: -1 });

    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/records — doctor creates a record tied to one of their appointments
async function createRecord(req, res) {
  try {
    const { appointmentId, diagnosis, prescription, notes } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ message: "appointmentId is required" });
    }

    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
    if (!doctorProfile) return res.status(404).json({ message: "Doctor profile not found" });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (String(appointment.doctor) !== String(doctorProfile._id)) {
      return res.status(403).json({ message: "This appointment does not belong to you" });
    }

    const record = await MedicalRecord.create({
      patient: appointment.patient,
      doctor: doctorProfile._id,
      appointment: appointment._id,
      diagnosis,
      prescription,
      notes,
    });

    appointment.status = "completed";
    await appointment.save();

    res.status(201).json({ record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/records/by-doctor — records the logged-in doctor has written
async function getRecordsByDoctor(req, res) {
  try {
    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
    if (!doctorProfile) return res.json({ records: [] });

    const records = await MedicalRecord.find({ doctor: doctorProfile._id })
      .populate({ path: "patient", populate: { path: "user", select: "name" } })
      .sort({ createdAt: -1 });

    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getMyRecords, createRecord, getRecordsByDoctor };