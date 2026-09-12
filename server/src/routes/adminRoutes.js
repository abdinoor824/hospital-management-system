const express = require("express");
const {
  createUser,
  listDoctors,
  listPatients,
  listAllAppointments,
  updateDoctor,
  deleteDoctor,
  updatePatient,
  deletePatient,
  toggleUserActive,
} = require("../controllers/adminController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.post("/users", createUser);
router.get("/doctors", listDoctors);
router.get("/patients", listPatients);
router.get("/appointments", listAllAppointments);

router.put("/doctors/:id", updateDoctor);
router.delete("/doctors/:id", deleteDoctor);

router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);

router.patch("/users/:userId/toggle-active", toggleUserActive);

module.exports = router;