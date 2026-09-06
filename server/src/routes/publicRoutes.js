const express = require("express");
const { listPublicDoctors } = require("../controllers/publicController");

const router = express.Router();

router.get("/doctors", listPublicDoctors);

module.exports = router;