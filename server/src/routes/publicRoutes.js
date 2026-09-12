const express = require("express");
const { listPublicDoctors, getPublicDoctorById } = require("../controllers/publicController");

const router = express.Router();

router.get("/doctors", listPublicDoctors);
router.get("/doctors/:id", getPublicDoctorById);

module.exports = router;