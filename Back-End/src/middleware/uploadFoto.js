const multer = require('multer');
const path = require('path');

// Configuración del almacenamiento
const storageFoto = multer.diskStorage({
  destination: (req, file, cb) => {
    // Carpeta donde se guardarán las fotos
    cb(null, 'uploads/fotos');
  },
  filename: (req, file, cb) => {
    // Nombre único para evitar colisiones
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname)); // conserva la extensión original
  },
});

// Middleware de subida
const uploadFoto = multer({
  storage: storageFoto,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máximo
  fileFilter: (req, file, cb) => {
    // Solo permitimos imágenes
    const permitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!permitidos.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten JPG, PNG o WEBP'), false);
    }
    cb(null, true);
  },
});

module.exports = uploadFoto;
