const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ROLE_LEVELS } = require('../config/roles');
const { USER_STATUS } = require('../config/userStatus');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, falta token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Verificar tokenVersion
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res
        .status(401)
        .json({ message: 'Token inválido, haga login de nuevo' });
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      return res.status(403).json({ message: 'Cuenta no activa' });
    }

    const role = user.role.toLowerCase();

    req.user = {
      id: user._id,
      role,
      roleLevel: ROLE_LEVELS[role],
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
