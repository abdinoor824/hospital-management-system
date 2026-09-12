const express = require("express");
const {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  cancelMyAppointment,
  rescheduleMyAppointment,
} = require("../controllers/appointmentController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, requireRole("patient"), createAppointment);
router.get("/mine", protect, getMyAppointments);
router.patch("/:id", protect, requireRole("doctor", "admin"), updateAppointmentStatus);
router.patch("/:id/cancel", protect, requireRole("patient"), cancelMyAppointment);
router.patch("/:id/reschedule", protect, requireRole("patient"), rescheduleMyAppointment);

module.exports = router;