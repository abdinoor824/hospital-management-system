const express = require("express");
const {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, requireRole("patient"), createAppointment);
router.get("/mine", protect, getMyAppointments);
router.patch("/:id", protect, requireRole("doctor", "admin"), updateAppointmentStatus);

module.exports = router;