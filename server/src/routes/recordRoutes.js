const express = require("express");
const { getMyRecords, createRecord, getRecordsByDoctor } = require("../controllers/recordController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/mine", protect, requireRole("patient"), getMyRecords);
router.post("/", protect, requireRole("doctor"), createRecord);
router.get("/by-doctor", protect, requireRole("doctor"), getRecordsByDoctor);

module.exports = router;