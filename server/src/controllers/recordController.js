const MedicalRecord = require("../models/MedicalRecord");
const PatientProfile = require("../models/PatientProfile");
const DoctorProfile = require("../models/DoctorProfile");
const Appointment = require("../models/Appointment");

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

// POST /api/records/:id/attachments — doctor adds a file to an existing record
async function addAttachment(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
    if (!doctorProfile) return res.status(404).json({ message: "Doctor profile not found" });

    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    if (String(record.doctor) !== String(doctorProfile._id)) {
      return res.status(403).json({ message: "This record does not belong to you" });
    }

    record.attachments.push({
      url: req.file.path,
      filename: req.file.originalname,
    });
    await record.save();

    res.json({ record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getMyRecords, createRecord, getRecordsByDoctor, addAttachment };