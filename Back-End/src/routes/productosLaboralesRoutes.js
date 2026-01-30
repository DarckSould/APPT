const express = require('express');
const router = express.Router();
const productosLaboralesController = require('../controllers/productosLaboralesController');
const auth = require('../middleware/authMiddleware');

/* =========================
   RUTAS PÚBLICAS
========================= */
router.get('/', productosLaboralesController.getProductos);

/* =========================
   RUTAS ADMIN
========================= */
router.post('/', auth, productosLaboralesController.createProducto);
router.put('/:id', auth, productosLaboralesController.updateProducto);
router.delete('/:id', auth, productosLaboralesController.deleteProducto);
router.patch(
  '/:id/recover',
  auth,
  productosLaboralesController.recoverProducto,
);
router.get('/hidden', auth, productosLaboralesController.getHiddenProductos);

module.exports = router;
