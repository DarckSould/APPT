const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { ROLE_LEVELS } = require('../config/roles');
const { USER_STATUS } = require('../config/userStatus');
const httpError = require('../utils/httpError');
const validateRequired = require('../utils/validateRequired');

/* =======================
   TOKENS
======================= */
const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      roleLevel: ROLE_LEVELS[user.role],
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

/* =======================
   AUDIT HELPER
======================= */
const logAuthAction = async ({ user, action, metadata = {}, context = {} }) => {
  await AuditLog.createLog({
    actor: user ? user._id : null,
    target: user ? user._id : null,
    targetModel: 'User',
    action,
    metadata,
    ipAddress: context.ipAddress || null,
    userAgent: context.userAgent || null,
  });
};

/* =======================
   LOGIN
======================= */
exports.loginUser = async ({ email, password }, context = {}) => {
  validateRequired({ email, password });

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    '+refreshToken',
  );
  if (!user) {
    // Log intento fallido anónimo
    await logAuthAction({
      user: null,
      action: 'LOGIN_FAILED',
      metadata: { emailAttempted: email },
      context,
    });
    throw httpError(400, 'Credenciales inválidas');
  }

  if (user.isLocked()) {
    throw httpError(
      403,
      `Cuenta bloqueada temporalmente. Intenta nuevamente en ${user.getLockRemainingTime()} minuto(s)`,
    );
  }

  const passwordValid = await user.comparePassword(password);
  if (!passwordValid) {
    await user.incrementLoginAttempts();

    await logAuthAction({
      user,
      action: 'LOGIN_FAILED',
      metadata: { reason: 'Contraseña incorrecta' },
      context,
    });

    throw httpError(400, 'Credenciales inválidas');
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw httpError(403, 'Cuenta no activa');
  }

  await user.resetLoginAttempts();

  // Login exitoso
  await logAuthAction({
    user,
    action: 'LOGIN_SUCCESS',
    context,
  });

  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  };
};

/* =======================
   LOGOUT
======================= */
exports.logout = async (refreshToken, context = {}) => {
  if (!refreshToken) return;

  const user = await User.findOne({ refreshToken });
  if (!user) return;

  user.refreshToken = undefined;
  user.tokenVersion += 1;
  await user.save();

  await logAuthAction({
    user,
    action: 'LOGOUT_USER',
    context,
  });
};

/* =======================
   PERFIL
======================= */
exports.getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw httpError(404, 'Usuario no encontrado');

  return user.toSafeObject();
};

/* =======================
   REFRESH TOKEN
======================= */
exports.refreshAccessToken = async (refreshToken, context = {}) => {
  if (!refreshToken) throw httpError(401, 'Refresh token requerido');

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw httpError(401, 'Refresh token inválido o expirado');
  }

  const user = await User.findById(payload.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken)
    throw httpError(401, 'Refresh token inválido');

  const newAccessToken = generateToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshToken = newRefreshToken;
  await user.save();

  // Opcional: log de refresh
  await logAuthAction({
    user,
    action: 'LOGIN_SUCCESS',
    metadata: { reason: 'Refresh token usado' },
    context,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
