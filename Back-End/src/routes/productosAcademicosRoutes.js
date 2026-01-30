const express = require('express');
const router = express.Router();
const productosAcademicosController = require('../controllers/productosAcademicosController');
const auth = require('../middleware/authMiddleware');

/* =========================
   RUTAS PÚBLICAS
========================= */
router.get('/', productosAcademicosController.getProductos);

/* =========================
   RUTAS ADMIN
========================= */
router.post('/', auth, productosAcademicosController.createProducto);
router.put('/:id', auth, productosAcademicosController.updateProducto);
router.delete('/:id', auth, productosAcademicosController.deleteProducto);
router.patch(
  '/:id/recover',
  auth,
  productosAcademicosController.recoverProducto,
);

router.get('/hidden', auth, productosAcademicosController.getHiddenProductos);
module.exports = router;
