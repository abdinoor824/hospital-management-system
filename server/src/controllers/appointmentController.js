const Appointment = require("../models/Appointment");
const PatientProfile = require("../models/PatientProfile");
const DoctorProfile = require("../models/DoctorProfile");

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

async function updateAppointmentStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "cancelled", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (status === "confirmed") {
      const Payment = require("../models/Payment");
      const payment = await Payment.findOne({ appointment: appointment._id, status: "paid" });
      if (!payment) {
        return res.status(400).json({ message: "Cannot confirm: patient has not paid for this appointment yet" });
      }
    }

    appointment.status = status;
    await appointment.save();

    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/appointments/:id/cancel — patient cancels their own pending appointment
async function cancelMyAppointment(req, res) {
  try {
    const patientProfile = await PatientProfile.findOne({ user: req.user._id });
    if (!patientProfile) return res.status(404).json({ message: "Patient profile not found" });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (String(appointment.patient) !== String(patientProfile._id)) {
      return res.status(403).json({ message: "This appointment does not belong to you" });
    }
    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be cancelled this way. Contact the doctor/admin for confirmed appointments." });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/appointments/:id/reschedule — patient edits date/time/reason while still pending
async function rescheduleMyAppointment(req, res) {
  try {
    const { date, time, reason } = req.body;
    if (!date || !time) {
      return res.status(400).json({ message: "date and time are required" });
    }

    const patientProfile = await PatientProfile.findOne({ user: req.user._id });
    if (!patientProfile) return res.status(404).json({ message: "Patient profile not found" });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (String(appointment.patient) !== String(patientProfile._id)) {
      return res.status(403).json({ message: "This appointment does not belong to you" });
    }
    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be rescheduled." });
    }

    appointment.date = date;
    appointment.time = time;
    if (reason !== undefined) appointment.reason = reason;
    await appointment.save();

    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  cancelMyAppointment,
  rescheduleMyAppointment,
};