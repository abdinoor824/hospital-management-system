const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const DoctorProfile = require("../models/DoctorProfile");

// POST /api/payments/cash — doctor records a cash payment for a walk-in appointment
async function recordCashPayment(req, res) {
  try {
    const { appointmentId, amount } = req.body;
    if (!appointmentId || !amount) {
      return res.status(400).json({ message: "appointmentId and amount are required" });
    }

    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
    if (!doctorProfile) return res.status(404).json({ message: "Doctor profile not found" });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (String(appointment.doctor) !== String(doctorProfile._id)) {
      return res.status(403).json({ message: "This appointment does not belong to you" });
    }

    const payment = await Payment.create({
      appointment: appointment._id,
      patient: appointment.patient,
      amount,
      method: "cash",
      status: "paid",
      reference: "cash-at-desk",
      paidAt: new Date(),
    });

    res.status(201).json({ payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/payments/for-appointment/:appointmentId — check if an appointment is paid
async function getPaymentForAppointment(req, res) {
  try {
    const payment = await Payment.findOne({ appointment: req.params.appointmentId }).sort({ createdAt: -1 });
    res.json({ payment: payment || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { recordCashPayment, getPaymentForAppointment };