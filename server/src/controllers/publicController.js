const DoctorProfile = require("../models/DoctorProfile");

// GET /api/public/doctors — no login required, powers the homepage
async function listPublicDoctors(req, res) {
  try {
    const doctors = await DoctorProfile.find()
      .populate("user", "name profilePicture")
      .select("specialization qualifications consultationFee availability user")
      .sort({ createdAt: -1 });

    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/public/doctors/:id — single doctor's public profile page
async function getPublicDoctorById(req, res) {
  try {
    const doctor = await DoctorProfile.findById(req.params.id)
      .populate("user", "name profilePicture")
      .select("specialization qualifications consultationFee availability user");

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { listPublicDoctors, getPublicDoctorById };