const authService = require('../services/authService');
const asyncHandler = require('../middleware/asyncHandler');

/* =======================
   LOGIN
======================= */
exports.login = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body);

  // Guardar refresh token en cookie httpOnly
  res.cookie('refreshToken', data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  });

  res.json({
    message: 'Inicio de sesión exitoso',
    user: data.user,
    accessToken: data.accessToken,
  });
});

/* =======================
   PROFILE
======================= */
exports.profile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json(user);
});

/* =======================
   REFRESH TOKEN
======================= */
exports.refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const data = await authService.refreshAccessToken(refreshToken);

  // Actualizar cookie (rotación)
  res.cookie('refreshToken', data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: 'Access token renovado',
    accessToken: data.accessToken,
  });
});

/* =======================
   LOGOUT
======================= */
exports.logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await authService.logout(refreshToken, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });
  }

  // Limpiar la cookie con las mismas opciones de seguridad
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // solo en HTTPS
    sameSite: 'Strict',
  });

  res.status(200).json({ message: 'Sesión cerrada correctamente' });
});
