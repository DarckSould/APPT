const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const userController = require('../controllers/userController');
const { ROLE_LEVELS } = require('../config/roles');

// Crear usuario (admin)
router.post('/', auth, authorize(ROLE_LEVELS.ADMIN), userController.createUser);

// Listar usuarios
router.get('/', auth, authorize(ROLE_LEVELS.ADMIN), userController.getUsers);

// Perfil propio
// Actualizar perfil propio
router.put('/profile', auth, userController.updateProfile);
// Cambiar contraseña propia
router.put('/profile/password', auth, userController.changePassword);

// Acciones administrativas sobre usuarios
router.put(
  '/:id',
  auth,
  authorize(ROLE_LEVELS.ADMIN),
  userController.updateUser,
);

module.exports = router;
