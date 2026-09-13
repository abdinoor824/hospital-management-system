const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: "hms-medical-records",
    resource_type: "auto", // handles images AND PDFs correctly
    public_id: `${req.user._id}-${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
  }),
});

function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG, WEBP, or PDF files are allowed"));
}

const uploadRecordFile = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

module.exports = uploadRecordFile;