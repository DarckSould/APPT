const multer = require('multer');
const path = require('path');

const storageFotoVenta = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/fotos_venta'); // carpeta separada para fotos de productos
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const uploadFotoVenta = multer({
  storage: storageFotoVenta,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const permitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!permitidos.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten JPG, PNG o WEBP'), false);
    }
    cb(null, true);
  },
});

module.exports = uploadFotoVenta;
