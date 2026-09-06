const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "PatientProfile", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["cash", "card", "mpesa"], required: true },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    reference: { type: String, trim: true }, // Stripe session id, M-Pesa receipt, or "cash" note
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);