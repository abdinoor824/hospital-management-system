const DoctorProfile = require("../models/DoctorProfile");

// GET /api/doctors — list all doctors (for patients to browse when booking)
async function listDoctors(req, res) {
  try {
    const doctors = await DoctorProfile.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/doctors/me — the logged-in doctor's own profile
async function getMyDoctorProfile(req, res) {
  try {
    const profile = await DoctorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Doctor profile not found" });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/doctors/me — doctor updates their own availability/fee/qualifications
async function updateMyDoctorProfile(req, res) {
  try {
    const { availability, consultationFee, qualifications } = req.body;

    const profile = await DoctorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Doctor profile not found" });

    if (availability !== undefined) profile.availability = availability;
    if (consultationFee !== undefined) profile.consultationFee = consultationFee;
    if (qualifications !== undefined) profile.qualifications = qualifications;

    await profile.save();
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { listDoctors, getMyDoctorProfile, updateMyDoctorProfile };