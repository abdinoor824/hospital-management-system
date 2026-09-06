const express = require("express");
const { createWalkinAppointment } = require("../controllers/walkinController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, requireRole("doctor"), createWalkinAppointment);

module.exports = router;