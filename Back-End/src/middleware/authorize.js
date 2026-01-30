const authorize = (minLevel) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  // Usamos roleLevel ya definido en authMiddleware
  if (!req.user.roleLevel || req.user.roleLevel < minLevel) {
    return res.status(403).json({ message: 'Permisos insuficientes' });
  }

  next();
};

module.exports = authorize;
