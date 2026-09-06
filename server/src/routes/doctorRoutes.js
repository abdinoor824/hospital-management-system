const express = require("express");
const { listDoctors, getMyDoctorProfile, updateMyDoctorProfile } = require("../controllers/doctorController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, listDoctors);
router.get("/me", protect, requireRole("doctor"), getMyDoctorProfile);
router.put("/me", protect, requireRole("doctor"), updateMyDoctorProfile);

module.exports = router;