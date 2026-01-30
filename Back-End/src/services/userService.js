const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const httpError = require('../utils/httpError');
const UserPolicy = require('../policies/user.policy');

/* =========================
   CREATE USER
   ========================= */
exports.createUser = async ({ requester, userData }) => {
  const { name, email, password, phone, location, role } = userData;

  if (!name || !email || !password || !role) {
    throw httpError(400, 'Campos obligatorios faltantes');
  }

  // Solo Admin puede crear Admin
  UserPolicy.canCreate(requester?.role, role);

  const exists = await User.findOne({ email });
  if (exists) throw httpError(400, 'El email ya está registrado');

  const user = await User.create({
    name,
    email,
    password,
    phone,
    location,
    role,
  });

  if (requester) {
    await AuditLog.createLog({
      actor: requester.id,
      target: user._id,
      targetModel: 'User',
      action: 'CREATE_USER',
      metadata: { createdRole: role },
    });
  }

  return { id: user._id, name: user.name, email: user.email, role: user.role };
};

/* =========================
   GET USERS
   ========================= */
exports.getUsers = async (requester) => {
  // Solo Admin puede listar usuarios (todos son Admin)
  UserPolicy.canList(requester.role);

  // No hay necesidad de filtros
  return User.find().select('-password');
};

/* =========================
   UPDATE USER
   ========================= */
exports.updateUser = async ({ requester, userId, data }) => {
  const user = await User.findById(userId);
  if (!user) throw httpError(404, 'Usuario no encontrado');

  UserPolicy.canUpdate(requester, user);

  const allowedFields = UserPolicy.allowedUpdateFields(requester.role);
  const changes = [];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== user[field]) {
      changes.push({ field, from: user[field], to: data[field] });
      user[field] = data[field];
    }
  });

  await user.save();

  if (changes.length) {
    await AuditLog.createLog({
      actor: requester.id,
      target: userId,
      targetModel: 'User',
      action: 'UPDATE_USER',
      changes,
    });
  }

  return { id: user._id, name: user.name, email: user.email, role: user.role };
};

/* =========================
   UPDATE PROFILE
   ========================= */
exports.updateProfile = async ({ requester, userId, data }) => {
  const user = await User.findById(userId);
  if (!user) throw httpError(404, 'Usuario no encontrado');

  UserPolicy.canUpdate(requester, user);

  const changes = [];
  ['name', 'phone', 'location', 'role', 'status'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== user[field]) {
      changes.push({ field, from: user[field], to: data[field] });
      user[field] = data[field];
    }
  });

  await user.save();

  if (changes.length) {
    await AuditLog.createLog({
      actor: requester.id,
      target: userId,
      targetModel: 'User',
      action: 'UPDATE_PROFILE',
      changes,
    });
  }

  return { id: user._id, name: user.name, email: user.email, role: user.role };
};

/* =========================
   CHANGE PASSWORD
   ========================= */
exports.changePassword = async ({
  requester,
  userId,
  currentPassword,
  newPassword,
}) => {
  if (!requester._id.equals(userId)) {
    throw httpError(403, 'No autorizado');
  }

  const user = await User.findById(userId);
  if (!user) throw httpError(404, 'Usuario no encontrado');

  const valid = await user.comparePassword(currentPassword);
  if (!valid) throw httpError(400, 'Contraseña actual incorrecta');

  user.password = newPassword;
  await user.save();

  await AuditLog.createLog({
    actor: requester.id,
    target: userId,
    targetModel: 'User',
    action: 'CHANGE_PASSWORD',
  });

  return { message: 'Contraseña actualizada correctamente' };
};
