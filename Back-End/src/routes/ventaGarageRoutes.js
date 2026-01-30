const express = require('express');
const router = express.Router();
const controller = require('../controllers/ventaGarageController');
const auth = require('../middleware/authMiddleware');
const uploadFotoVenta = require('../middleware/uploadFotoVenta'); // multer

/* =========================
   RUTAS PÚBLICAS
========================= */
router.get('/', controller.getProductos);

/* =========================
   RUTAS ADMIN
========================= */
// Crear producto (con foto opcional)
router.post(
  '/',
  auth,
  uploadFotoVenta.single('foto'),
  controller.createProducto,
);

// Actualizar producto (con foto opcional)
router.put(
  '/:id',
  auth,
  uploadFotoVenta.single('foto'),
  controller.updateProducto,
);

// Ocultar producto
router.delete('/:id', auth, controller.deleteProducto);

// Recuperar producto
router.patch('/:id/recover', auth, controller.recoverProducto);

// Listar productos ocultos
router.get('/hidden', auth, controller.getHiddenProductos);

// Actualizar solo foto de producto
router.post(
  '/:id/foto',
  auth,
  uploadFotoVenta.single('foto'),
  controller.updateFotoProducto,
);

module.exports = router;
