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

module.exports = { listPublicDoctors };