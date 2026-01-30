const express = require('express');
const router = express.Router();
const datosPersonalesController = require('../controllers/datosPersonalesController');
const auth = require('../middleware/authMiddleware');
const uploadFoto = require('../middleware/uploadFoto');

/* =========================
   RUTAS PÚBLICAS
========================= */
router.get('/', datosPersonalesController.getPerfil);

/* =========================
   RUTAS ADMIN
========================= */

// Actualizar / subir foto
router.post(
  '/foto',
  auth,
  uploadFoto.single('foto'),
  datosPersonalesController.updateFotoPerfil,
);

// Listar perfil oculto
router.get('/hidden', auth, datosPersonalesController.getHiddenPerfil);

// Recuperar perfil
router.patch('/recover', auth, datosPersonalesController.recoverPerfil);

// Crear o actualizar perfil
router.post('/', auth, datosPersonalesController.createOrUpdatePerfil);

// Ocultar perfil
router.delete('/', auth, datosPersonalesController.deletePerfil);

module.exports = router;
