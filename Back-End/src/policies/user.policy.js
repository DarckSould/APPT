const { ROLES, ROLE_LEVELS } = require('../config/roles');

/* =========================
   CREACIÓN DE USUARIOS
   ========================= */

exports.canCreate = (creatorRole, targetRole) => {
  // Solo existe ADMIN, no hay registro público ni otros roles
  if (creatorRole !== ROLES.ADMIN || targetRole !== ROLES.ADMIN) {
    throw new Error('No autorizado');
  }
};

/* =========================
   LISTADO
   ========================= */

exports.canList = (role) => {
  // Solo admins existen, siempre autorizado
  if (role !== ROLES.ADMIN) {
    throw new Error('No autorizado');
  }
};

/* =========================
   ACTUALIZACIÓN
   ========================= */

exports.canUpdate = (requester, target) => {
  // Solo admins pueden actualizar otros admins
  if (requester.role !== ROLES.ADMIN || target.role !== ROLES.ADMIN) {
    throw new Error('No autorizado para modificar este usuario');
  }
};

exports.allowedUpdateFields = (role) => {
  // ADMIN solo
  return ['name', 'phone', 'location', 'role', 'status'];
};
