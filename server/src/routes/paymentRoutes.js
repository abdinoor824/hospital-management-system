const express = require("express");
const { recordCashPayment, getPaymentForAppointment } = require("../controllers/paymentController");
const { createCheckoutSession, verifyCheckoutSession } = require("../controllers/stripeController");
const { initiateStkPush, mpesaCallback, getStkStatus } = require("../controllers/mpesaController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/cash", protect, requireRole("doctor"), recordCashPayment);
router.get("/for-appointment/:appointmentId", protect, getPaymentForAppointment);

router.post("/stripe/create-checkout-session", protect, requireRole("patient"), createCheckoutSession);
router.get("/stripe/verify/:sessionId", protect, verifyCheckoutSession);

router.post("/mpesa/stkpush", protect, requireRole("patient"), initiateStkPush);
router.post("/mpesa/callback", mpesaCallback); // no auth — Safaricom calls this directly
router.get("/mpesa/status/:checkoutRequestId", protect, getStkStatus);

module.exports = router;