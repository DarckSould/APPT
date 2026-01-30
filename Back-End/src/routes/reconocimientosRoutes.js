const express = require('express');
const router = express.Router();
const controller = require('../controllers/reconocimientosController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadCertificado = require('../middleware/uploadCertificado');

// Público
router.get('/', controller.getReconocimientos);
router.get('/:id/certificado', controller.obtenerCertificadoPublico);

// Admin
router.post(
  '/',
  authMiddleware,
  uploadCertificado.single('certificado'),
  controller.createReconocimiento,
);

router.put(
  '/:id',
  authMiddleware,
  uploadCertificado.single('certificado'),
  controller.updateReconocimiento,
);

// Soft delete (ocultar)
router.delete('/:id', authMiddleware, controller.deleteReconocimiento);

// Recuperar (undo soft delete)
router.patch('/:id/recover', authMiddleware, controller.recoverReconocimiento);

router.get('/hidden', authMiddleware, controller.getHiddenReconocimientos);
module.exports = router;
