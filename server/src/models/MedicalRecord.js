const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "PatientProfile", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    diagnosis: { type: String, trim: true },
    prescription: { type: String, trim: true },
    notes: { type: String, trim: true },
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);