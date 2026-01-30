const ExperienciaLaboral = require('../models/ExperienciaLaboral');
const AuditLog = require('../models/AuditLog');
const httpError = require('../utils/httpError');
const fs = require('fs');
const path = require('path');

const PERFIL_ID = 1;

/* =========================
   OBTENER EXPERIENCIAS
========================= */
exports.getExperiencias = async () => {
  return await ExperienciaLaboral.obtenerParaFront(PERFIL_ID);
};

/* =========================
   CREAR EXPERIENCIA
========================= */
exports.createExperiencia = async ({ requester, data, file }) => {
  if (!requester || requester.role !== 'admin')
    throw httpError(403, 'No autorizado');

  data.idperfilconqueestaactivo = PERFIL_ID;
  data.activarparaqueseveaenfront = true;

  if (file) {
    data.rutacertificado = `/uploads/certificados/${file.filename}`;
  }

  try {
    const experiencia = await ExperienciaLaboral.create(data);

    await AuditLog.createLog({
      actor: requester.id,
      target: experiencia._id,
      targetModel: 'ExperienciaLaboral',
      action: 'CREATE_EXPERIENCIA',
    });

    return experiencia;
  } catch (err) {
    throw httpError(400, err.message);
  }
};

/* =========================
   ACTUALIZAR EXPERIENCIA
========================= */
exports.updateExperiencia = async ({ requester, id, data, file }) => {
  if (!requester || requester.role !== 'admin')
    throw httpError(403, 'No autorizado');

  const experiencia = await ExperienciaLaboral.findById(id);
  if (!experiencia) throw httpError(404, 'Experiencia no encontrada');

  const changes = [];

  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== experiencia[key]) {
      changes.push({ field: key, from: experiencia[key], to: data[key] });
      experiencia[key] = data[key];
    }
  });

  if (file) {
    if (experiencia.rutacertificado) {
      const rutaVieja = path.join(
        __dirname,
        '..',
        '..',
        experiencia.rutacertificado,
      );
      if (fs.existsSync(rutaVieja)) fs.unlinkSync(rutaVieja);
    }
    experiencia.rutacertificado = `/uploads/certificados/${file.filename}`;
  }

  try {
    await experiencia.save();

    if (changes.length) {
      await AuditLog.createLog({
        actor: requester.id,
        target: experiencia._id,
        targetModel: 'ExperienciaLaboral',
        action: 'UPDATE_EXPERIENCIA',
        changes,
      });
    }

    return experiencia;
  } catch (err) {
    throw httpError(400, err.message);
  }
};

/* =========================
   OCULTAR EXPERIENCIA (SOFT DELETE)
========================= */
exports.deleteExperiencia = async ({ requester, id }) => {
  if (!requester || requester.role !== 'admin')
    throw httpError(403, 'No autorizado');

  const experiencia = await ExperienciaLaboral.findById(id);
  if (!experiencia) throw httpError(404, 'Experiencia no encontrada');

  // soft delete
  experiencia.activarparaqueseveaenfront = false;
  await experiencia.save();

  await AuditLog.createLog({
    actor: requester.id,
    target: experiencia._id,
    targetModel: 'ExperienciaLaboral',
    action: 'HIDE_EXPERIENCIA',
  });

  return { message: 'Experiencia ocultada correctamente' };
};

/* =========================
   DESCARGAR CERTIFICADO
========================= */
exports.obtenerCertificadoPublico = async ({ id }) => {
  const experiencia = await ExperienciaLaboral.findById(id);
  if (!experiencia) throw httpError(404, 'Experiencia no encontrada');
  if (!experiencia.rutacertificado) throw httpError(404, 'No hay certificado');

  const ruta = path.join(__dirname, '..', '..', experiencia.rutacertificado);
  if (!fs.existsSync(ruta)) throw httpError(404, 'Archivo no existe');

  await AuditLog.createLog({
    actor: null,
    target: experiencia._id,
    targetModel: 'ExperienciaLaboral',
    action: 'DOWNLOAD_CERTIFICADO_EXPERIENCIA_PUBLICO',
  });

  return {
    ruta,
    nombre: path.basename(experiencia.rutacertificado),
  };
};

/* =========================
   RECUPERAR EXPERIENCIA
========================= */
exports.recoverExperiencia = async ({ requester, id }) => {
  if (!requester || requester.role !== 'admin')
    throw httpError(403, 'No autorizado');

  const experiencia = await ExperienciaLaboral.findById(id);
  if (!experiencia) throw httpError(404, 'Experiencia no encontrada');

  if (experiencia.activarparaqueseveaenfront === true) {
    throw httpError(400, 'La experiencia ya está visible');
  }

  experiencia.activarparaqueseveaenfront = true;
  await experiencia.save();

  await AuditLog.createLog({
    actor: requester.id,
    target: experiencia._id,
    targetModel: 'ExperienciaLaboral',
    action: 'RECOVER_EXPERIENCIA',
  });

  return { message: 'Experiencia recuperada correctamente' };
};

/* =========================================================
   LISTAR EXPERIENCIAS OCULTAS (solo admin)
========================================================= */
exports.getHiddenExperiencias = async ({ requester }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const experiencias = await ExperienciaLaboral.find({
    idperfilconqueestaactivo: PERFIL_ID,
    activarparaqueseveaenfront: false,
  }).sort({ fechaInicio: -1 }); // puedes ordenar por fecha u otro campo

  if (!experiencias || experiencias.length === 0) {
    throw httpError(404, 'No hay experiencias ocultas');
  }

  // 🔹 Registrar auditoría
  for (const experiencia of experiencias) {
    await AuditLog.createLog({
      actor: requester.id,
      target: experiencia._id, // cada experiencia tiene su log
      targetModel: 'ExperienciaLaboral',
      action: 'VIEW_HIDDEN_EXPERIENCIAS',
    });
  }

  return experiencias;
};
