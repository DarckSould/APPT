const Reconocimiento = require('../models/Reconocimientos');
const AuditLog = require('../models/AuditLog');
const httpError = require('../utils/httpError');
const fs = require('fs');
const path = require('path');

const PERFIL_ID = 1;

/* =========================================================
   OBTENER RECONOCIMIENTOS (SOLO VISIBLES)
========================================================= */
exports.getReconocimientos = async () => {
  return await Reconocimiento.obtenerParaFront(PERFIL_ID);
};

/* =========================================================
   CREAR RECONOCIMIENTO
========================================================= */
exports.createReconocimiento = async ({ requester, data, file }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  data.idperfilconqueestaactivo = PERFIL_ID;
  data.activarparaqueseveaenfront = true;

  if (file) {
    data.rutacertificado = `/uploads/certificados/${file.filename}`;
  }

  try {
    const reconocimiento = await Reconocimiento.create(data);

    await AuditLog.createLog({
      actor: requester.id,
      target: reconocimiento._id,
      targetModel: 'Reconocimiento',
      action: 'CREATE_RECONOCIMIENTO',
    });

    return reconocimiento;
  } catch (err) {
    throw httpError(400, err.message);
  }
};

/* =========================================================
   ACTUALIZAR RECONOCIMIENTO
========================================================= */
exports.updateReconocimiento = async ({ requester, id, data, file }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const reconocimiento = await Reconocimiento.findById(id);
  if (!reconocimiento) {
    throw httpError(404, 'Reconocimiento no encontrado');
  }

  const changes = [];

  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== reconocimiento[key]) {
      changes.push({ field: key, from: reconocimiento[key], to: data[key] });
      reconocimiento[key] = data[key];
    }
  });

  if (file) {
    if (reconocimiento.rutacertificado) {
      const rutaVieja = path.join(
        __dirname,
        '..',
        '..',
        reconocimiento.rutacertificado,
      );
      if (fs.existsSync(rutaVieja)) fs.unlinkSync(rutaVieja);
    }
    reconocimiento.rutacertificado = `/uploads/certificados/${file.filename}`;
  }

  try {
    await reconocimiento.save();

    if (changes.length) {
      await AuditLog.createLog({
        actor: requester.id,
        target: reconocimiento._id,
        targetModel: 'Reconocimiento',
        action: 'UPDATE_RECONOCIMIENTO',
        changes,
      });
    }

    return reconocimiento;
  } catch (err) {
    throw httpError(400, err.message);
  }
};

/* =========================================================
   ELIMINAR RECONOCIMIENTO (SOFT DELETE)
========================================================= */
exports.deleteReconocimiento = async ({ requester, id }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const reconocimiento = await Reconocimiento.findById(id);
  if (!reconocimiento) {
    throw httpError(404, 'Reconocimiento no encontrado');
  }

  // soft delete
  reconocimiento.activarparaqueseveaenfront = false;
  await reconocimiento.save();

  await AuditLog.createLog({
    actor: requester.id,
    target: reconocimiento._id,
    targetModel: 'Reconocimiento',
    action: 'HIDE_RECONOCIMIENTO',
  });

  return { message: 'Reconocimiento ocultado correctamente' };
};

/* =========================================================
   DESCARGAR CERTIFICADO PÚBLICO
========================================================= */
exports.obtenerCertificadoPublico = async ({ id }) => {
  const rec = await Reconocimiento.findById(id);
  if (!rec) throw httpError(404, 'Reconocimiento no encontrado');
  if (!rec.rutacertificado) throw httpError(404, 'No hay certificado');

  const rutaAbsoluta = path.join(__dirname, '..', '..', rec.rutacertificado);
  if (!fs.existsSync(rutaAbsoluta)) {
    throw httpError(404, 'Archivo no existe');
  }

  await AuditLog.createLog({
    actor: null,
    target: rec._id,
    targetModel: 'Reconocimiento',
    action: 'DOWNLOAD_CERTIFICADO_RECONOCIMIENTO_PUBLICO',
  });

  return {
    ruta: rutaAbsoluta,
    nombre: path.basename(rec.rutacertificado),
  };
};

/* =========================================================
   RECUPERAR RECONOCIMIENTO (UNDO SOFT DELETE)
========================================================= */
exports.recoverReconocimiento = async ({ requester, id }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const reconocimiento = await Reconocimiento.findById(id);
  if (!reconocimiento) {
    throw httpError(404, 'Reconocimiento no encontrado');
  }

  if (reconocimiento.activarparaqueseveaenfront === true) {
    throw httpError(400, 'El reconocimiento ya está activo');
  }

  reconocimiento.activarparaqueseveaenfront = true;
  await reconocimiento.save();

  await AuditLog.createLog({
    actor: requester.id,
    target: reconocimiento._id,
    targetModel: 'Reconocimiento',
    action: 'RECOVER_RECONOCIMIENTO',
    changes: [
      {
        field: 'activarparaqueseveaenfront',
        from: false,
        to: true,
      },
    ],
  });

  return {
    message: 'Reconocimiento recuperado correctamente',
    reconocimiento,
  };
};

/* =========================================================
   LISTAR RECONOCIMIENTOS OCULTOS (solo admin)
========================================================= */
exports.getHiddenReconocimientos = async ({ requester }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  // Obtener reconocimientos ocultos
  const reconocimientos = await Reconocimiento.find({
    idperfilconqueestaactivo: PERFIL_ID,
    activarparaqueseveaenfront: false,
  }).sort({ fechareconocimiento: -1 }); // ordenar por fecha

  if (!reconocimientos || reconocimientos.length === 0) {
    throw httpError(404, 'No hay reconocimientos ocultos');
  }

  // Registrar auditoría: un log por cada reconocimiento oculto
  for (const rec of reconocimientos) {
    await AuditLog.createLog({
      actor: requester.id,
      target: rec._id, // cada reconocimiento tiene su propio log
      targetModel: 'Reconocimiento',
      action: 'VIEW_HIDDEN_RECONOCIMIENTOS',
    });
  }

  return reconocimientos;
};
