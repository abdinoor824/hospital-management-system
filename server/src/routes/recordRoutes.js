const express = require("express");
const { getMyRecords, createRecord, getRecordsByDoctor, addAttachment } = require("../controllers/recordController");
const { protect, requireRole } = require("../middleware/auth");
const uploadRecordFile = require("../middleware/uploadRecordFile");

const router = express.Router();

router.get("/mine", protect, requireRole("patient"), getMyRecords);
router.post("/", protect, requireRole("doctor"), createRecord);
router.get("/by-doctor", protect, requireRole("doctor"), getRecordsByDoctor);
router.post("/:id/attachments", protect, requireRole("doctor"), uploadRecordFile.single("file"), addAttachment);

module.exports = router;