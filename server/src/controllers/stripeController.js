const Stripe = require("stripe");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const { sendPaymentReceivedEmail } = require("../utils/mailer");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(req, res) {
  try {
    const { appointmentId, amount } = req.body;
    if (!appointmentId || !amount) {
      return res.status(400).json({ message: "appointmentId and amount are required" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "kes",
            product_data: { name: "Doctor consultation fee" },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&appointmentId=${appointmentId}`,
      cancel_url: `${clientUrl}/patient/appointments`,
      metadata: { appointmentId, patientId: String(appointment.patient) },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function verifyCheckoutSession(req, res) {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    if (session.payment_status !== "paid") {
      return res.json({ payment: null, status: session.payment_status });
    }

    const { appointmentId, patientId } = session.metadata;

    let payment = await Payment.findOne({ appointment: appointmentId, reference: session.id });
    let isNewPayment = false;

    if (!payment) {
      payment = await Payment.create({
        appointment: appointmentId,
        patient: patientId,
        amount: session.amount_total / 100,
        method: "card",
        status: "paid",
        reference: session.id,
        paidAt: new Date(),
      });
      isNewPayment = true;
    }

    if (isNewPayment) {
      const populated = await Appointment.findById(appointmentId)
        .populate({ path: "patient", populate: { path: "user", select: "name email" } })
        .populate({ path: "doctor", populate: { path: "user", select: "name" } });

      if (populated?.patient?.user?.email) {
        sendPaymentReceivedEmail({
          patientEmail: populated.patient.user.email,
          patientName: populated.patient.user.name,
          amount: payment.amount,
          method: "card",
          doctorName: populated.doctor?.user?.name || "your doctor",
        });
      }
    }

    res.json({ payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createCheckoutSession, verifyCheckoutSession };