const Stripe = require("stripe");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/stripe/create-checkout-session
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
            unit_amount: Math.round(Number(amount) * 100), // Stripe uses smallest currency unit
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

// GET /api/payments/stripe/verify/:sessionId
async function verifyCheckoutSession(req, res) {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    if (session.payment_status !== "paid") {
      return res.json({ payment: null, status: session.payment_status });
    }

    const { appointmentId, patientId } = session.metadata;

    let payment = await Payment.findOne({ appointment: appointmentId, reference: session.id });
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
    }

    res.json({ payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createCheckoutSession, verifyCheckoutSession };