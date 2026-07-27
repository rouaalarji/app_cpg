const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dossierUpload = path.join(__dirname, '../uploads/justificatifs');
if (!fs.existsSync(dossierUpload)) {
  fs.mkdirSync(dossierUpload, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dossierUpload),
  filename: (req, file, cb) => {
    const suffixe = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, suffixe + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
});

module.exports = upload;