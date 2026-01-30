const express = require('express');
const router = express.Router();
const controller = require('../controllers/experienciaLaboralController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadCertificado');

// Público
router.get('/', controller.getExperiencias);
router.get('/:id/certificado', controller.obtenerCertificadoPublico);

// Admin
router.post(
  '/',
  auth,
  upload.single('certificado'),
  controller.createExperiencia,
);
router.put(
  '/:id',
  auth,
  upload.single('certificado'),
  controller.updateExperiencia,
);
router.delete('/:id', auth, controller.deleteExperiencia);
router.patch('/:id/recover', auth, controller.recoverExperiencia);
router.get('/hidden', auth, controller.getHiddenExperiencias);

module.exports = router;
