const express = require("express");
const { createUser, listDoctors, listPatients, listAllAppointments } = require("../controllers/adminController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.post("/users", createUser);
router.get("/doctors", listDoctors);
router.get("/patients", listPatients);
router.get("/appointments", listAllAppointments);

module.exports = router;