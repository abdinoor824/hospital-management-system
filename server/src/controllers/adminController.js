const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");
const PatientProfile = require("../models/PatientProfile");
const Appointment = require("../models/Appointment");

async function createUser(req, res) {
  try {
    const { name, email, password, phone, role, specialization, qualifications, consultationFee } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password and role are required" });
    }
    if (!["doctor", "admin", "patient"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, phone, role });

    if (role === "doctor") {
      if (!specialization) {
        return res.status(400).json({ message: "specialization is required for doctors" });
      }
      await DoctorProfile.create({
        user: user._id,
        specialization,
        qualifications,
        consultationFee: consultationFee || 0,
      });
    } else if (role === "patient") {
      await PatientProfile.create({ user: user._id });
    }

    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function listDoctors(req, res) {
  try {
    const doctors = await DoctorProfile.find().populate("user", "name email phone isActive").sort({ createdAt: -1 });
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function listPatients(req, res) {
  try {
    const patients = await PatientProfile.find().populate("user", "name email phone isActive").sort({ createdAt: -1 });
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function listAllAppointments(req, res) {
  try {
    const appointments = await Appointment.find()
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .populate({ path: "patient", populate: { path: "user", select: "name" } })
      .sort({ date: -1, time: -1 });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/admin/doctors/:id — edit a doctor's profile + linked user info
async function updateDoctor(req, res) {
  try {
    const { name, phone, specialization, qualifications, consultationFee } = req.body;

    const doctorProfile = await DoctorProfile.findById(req.params.id);
    if (!doctorProfile) return res.status(404).json({ message: "Doctor not found" });

    if (specialization !== undefined) doctorProfile.specialization = specialization;
    if (qualifications !== undefined) doctorProfile.qualifications = qualifications;
    if (consultationFee !== undefined) doctorProfile.consultationFee = consultationFee;
    await doctorProfile.save();

    const user = await User.findById(doctorProfile.user);
    if (user) {
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      await user.save();
    }

    const updated = await DoctorProfile.findById(req.params.id).populate("user", "name email phone isActive");
    res.json({ doctor: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/admin/doctors/:id — remove a doctor entirely (profile + user account)
async function deleteDoctor(req, res) {
  try {
    const doctorProfile = await DoctorProfile.findById(req.params.id);
    if (!doctorProfile) return res.status(404).json({ message: "Doctor not found" });

    await User.findByIdAndDelete(doctorProfile.user);
    await doctorProfile.deleteOne();

    res.json({ message: "Doctor deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/admin/patients/:id — edit a patient's profile + linked user info
async function updatePatient(req, res) {
  try {
    const { name, phone, dob, gender, bloodGroup, address, emergencyContact } = req.body;

    const patientProfile = await PatientProfile.findById(req.params.id);
    if (!patientProfile) return res.status(404).json({ message: "Patient not found" });

    if (dob !== undefined) patientProfile.dob = dob;
    if (gender !== undefined) patientProfile.gender = gender;
    if (bloodGroup !== undefined) patientProfile.bloodGroup = bloodGroup;
    if (address !== undefined) patientProfile.address = address;
    if (emergencyContact !== undefined) patientProfile.emergencyContact = emergencyContact;
    await patientProfile.save();

    const user = await User.findById(patientProfile.user);
    if (user) {
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      await user.save();
    }

    const updated = await PatientProfile.findById(req.params.id).populate("user", "name email phone isActive");
    res.json({ patient: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/admin/patients/:id — remove a patient entirely (profile + user account)
async function deletePatient(req, res) {
  try {
    const patientProfile = await PatientProfile.findById(req.params.id);
    if (!patientProfile) return res.status(404).json({ message: "Patient not found" });

    await User.findByIdAndDelete(patientProfile.user);
    await patientProfile.deleteOne();

    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/admin/users/:userId/toggle-active — suspend/reactivate any account
async function toggleUserActive(req, res) {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot deactivate an admin account" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createUser,
  listDoctors,
  listPatients,
  listAllAppointments,
  updateDoctor,
  deleteDoctor,
  updatePatient,
  deletePatient,
  toggleUserActive,
};