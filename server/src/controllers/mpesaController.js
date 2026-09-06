const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");

const BASE_URL = "https://sandbox.safaricom.co.ke"; // swap to https://api.safaricom.co.ke when going live

function getTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) throw new Error("Failed to get M-Pesa access token");
  const data = await res.json();
  return data.access_token;
}

// POST /api/payments/mpesa/stkpush — patient triggers a payment prompt on their phone
async function initiateStkPush(req, res) {
  try {
    const { appointmentId, phone, amount } = req.body;
    if (!appointmentId || !phone || !amount) {
      return res.status(400).json({ message: "appointmentId, phone and amount are required" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Normalize phone to 2547XXXXXXXX format
    let normalizedPhone = phone.trim().replace(/\D/g, "");
    if (normalizedPhone.startsWith("0")) normalizedPhone = "254" + normalizedPhone.slice(1);
    if (normalizedPhone.startsWith("7") || normalizedPhone.startsWith("1")) normalizedPhone = "254" + normalizedPhone;

    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const stkRes = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(Number(amount)),
        PartyA: normalizedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: normalizedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "HMS-" + appointmentId,
        TransactionDesc: "Doctor consultation fee",
      }),
    });

    const stkData = await stkRes.json();

    if (!stkRes.ok || stkData.errorMessage) {
      return res.status(400).json({ message: stkData.errorMessage || "STK push failed" });
    }

    // Save a pending payment, referenced by CheckoutRequestID so the callback can find it later
    await Payment.create({
      appointment: appointment._id,
      patient: appointment.patient,
      amount,
      method: "mpesa",
      status: "pending",
      reference: stkData.CheckoutRequestID,
    });

    res.json({ checkoutRequestId: stkData.CheckoutRequestID, message: "Check your phone to complete payment" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/payments/mpesa/callback — Safaricom calls this automatically, no auth
async function mpesaCallback(req, res) {
  try {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) return res.status(200).json({ message: "No callback data" });
  console.log("M-PESA CALLBACK RECEIVED:", JSON.stringify(callback, null, 2));
    const { CheckoutRequestID, ResultCode } = callback;
      
    const payment = await Payment.findOne({ reference: CheckoutRequestID });
    if (!payment) return res.status(200).json({ message: "Payment record not found" });

    if (ResultCode === 0) {
      payment.status = "paid";
      payment.paidAt = new Date();
    } else {
      payment.status = "failed";
    }
    await payment.save();

    res.status(200).json({ message: "Callback processed" });
  } catch (err) {
    console.error("M-Pesa callback error:", err.message);
    res.status(200).json({ message: "Error logged" }); // always 200 so Safaricom doesn't retry endlessly
  }
}

// GET /api/payments/mpesa/status/:checkoutRequestId — frontend polls this while waiting
async function getStkStatus(req, res) {
  try {
    const payment = await Payment.findOne({ reference: req.params.checkoutRequestId });
    if (!payment) return res.json({ status: "pending" });
    res.json({ status: payment.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { initiateStkPush, mpesaCallback, getStkStatus };