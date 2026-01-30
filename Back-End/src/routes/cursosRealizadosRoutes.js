const express = require('express');
const router = express.Router();
const controller = require('../controllers/cursosRealizadosController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadCertificado');

// Público
router.get('/', controller.getCursos);
router.get('/:id/certificado', controller.obtenerCertificadoPublico);

// Admin
router.post('/', auth, upload.single('certificado'), controller.createCurso);
router.put('/:id', auth, upload.single('certificado'), controller.updateCurso);
router.delete('/:id', auth, controller.deleteCurso);
router.patch('/:id/recover', auth, controller.recoverCurso);
router.get('/hidden', auth, controller.getHiddenCursos);

module.exports = router;
