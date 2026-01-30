const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Login
router.post('/login', authController.login);

// Perfil (access token requerido)
router.get('/profile', authMiddleware, authController.profile);

// Refresh Token (usa cookie httpOnly)
router.post('/refresh', authController.refresh);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
