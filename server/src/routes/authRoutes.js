const express = require("express");
const {
  register,
  login,
  googleLogin,
  me,
  updateMe,
  changePassword,
  uploadProfilePicture,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", protect, me);
router.put("/me", protect, updateMe);
router.put("/password", protect, changePassword);
router.post("/profile-picture", protect, upload.single("photo"), uploadProfilePicture);

module.exports = router;