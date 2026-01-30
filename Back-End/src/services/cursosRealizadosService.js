const CursosRealizados = require('../models/CursosRealizados');
const AuditLog = require('../models/AuditLog');
const httpError = require('../utils/httpError');
const fs = require('fs');
const path = require('path');

const PERFIL_ID = 1;

module.exports = {
  /* =========================
     OBTENER CURSOS
  ========================== */
  getCursos: async () => {
    return await CursosRealizados.obtenerParaFront(PERFIL_ID);
  },

  /* =========================
     CREAR CURSO
  ========================== */
  createCurso: async ({ requester, data, file }) => {
    if (!requester || requester.role !== 'admin')
      throw httpError(403, 'No autorizado');

    data.idperfilconqueestaactivo = PERFIL_ID;
    data.activarparaqueseveaenfront = true;

    if (file) data.rutacertificado = `/uploads/certificados/${file.filename}`;

    const curso = await CursosRealizados.create(data);

    await AuditLog.createLog({
      actor: requester.id,
      target: curso._id,
      targetModel: 'CursosRealizados',
      action: 'CREATE_CURSO',
    });

    return curso;
  },

  /* =========================
     ACTUALIZAR CURSO
  ========================== */
  updateCurso: async ({ requester, id, data, file }) => {
    if (!requester || requester.role !== 'admin')
      throw httpError(403, 'No autorizado');

    const curso = await CursosRealizados.findById(id);
    if (!curso) throw httpError(404, 'Curso no encontrado');

    const changes = [];
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== curso[key]) {
        changes.push({ field: key, from: curso[key], to: data[key] });
        curso[key] = data[key];
      }
    });

    if (file) {
      if (curso.rutacertificado) {
        const rutaVieja = path.join(
          __dirname,
          '..',
          '..',
          curso.rutacertificado,
        );
        if (fs.existsSync(rutaVieja)) fs.unlinkSync(rutaVieja);
      }
      curso.rutacertificado = `/uploads/certificados/${file.filename}`;
    }

    await curso.save();

    if (changes.length) {
      await AuditLog.createLog({
        actor: requester.id,
        target: curso._id,
        targetModel: 'CursosRealizados',
        action: 'UPDATE_CURSO',
        changes,
      });
    }

    return curso;
  },

  /* =========================
     ELIMINAR CURSO (SOFT DELETE)
  ========================== */
  deleteCurso: async ({ requester, id }) => {
    if (!requester || requester.role !== 'admin')
      throw httpError(403, 'No autorizado');

    const curso = await CursosRealizados.findById(id);
    if (!curso) throw httpError(404, 'Curso no encontrado');

    curso.activarparaqueseveaenfront = false;
    await curso.save();

    await AuditLog.createLog({
      actor: requester.id,
      target: curso._id,
      targetModel: 'CursosRealizados',
      action: 'HIDE_CURSO',
    });

    return { message: 'Curso ocultado correctamente' };
  },

  /* =========================
     RECUPERAR CURSO
  ========================== */
  recoverCurso: async ({ requester, id }) => {
    if (!requester || requester.role !== 'admin')
      throw httpError(403, 'No autorizado');

    const curso = await CursosRealizados.findById(id);
    if (!curso) throw httpError(404, 'Curso no encontrado');

    if (curso.activarparaqueseveaenfront === true) {
      throw httpError(400, 'El curso ya está visible');
    }

    curso.activarparaqueseveaenfront = true;
    await curso.save();

    await AuditLog.createLog({
      actor: requester.id,
      target: curso._id,
      targetModel: 'CursosRealizados',
      action: 'RECOVER_CURSO',
    });

    return { message: 'Curso recuperado correctamente' };
  },

  /* =========================
     DESCARGAR CERTIFICADO
  ========================== */
  obtenerCertificadoPublico: async ({ id }) => {
    const curso = await CursosRealizados.findById(id);
    if (!curso) throw httpError(404, 'Curso no encontrado');
    if (!curso.rutacertificado) throw httpError(404, 'No hay certificado');

    const ruta = path.join(__dirname, '..', '..', curso.rutacertificado);
    if (!fs.existsSync(ruta)) throw httpError(404, 'Archivo no existe');

    await AuditLog.createLog({
      actor: null,
      target: curso._id,
      targetModel: 'CursosRealizados',
      action: 'DOWNLOAD_CERTIFICADO_CURSO_PUBLICO',
    });

    return { ruta, nombre: path.basename(curso.rutacertificado) };
  },

  /* =========================
   LISTAR CURSOS OCULTOS (SOLO ADMIN)
========================= */
  getHiddenCursos: async ({ requester }) => {
    if (!requester || requester.role !== 'admin')
      throw httpError(403, 'No autorizado');

    // 🔹 Obtener todos los cursos ocultos
    const cursos = await CursosRealizados.find({
      activarparaqueseveaenfront: false,
    }).sort({ fechaInicio: -1 }); // opcional: ordenar por fecha de inicio

    if (!cursos || cursos.length === 0) {
      throw httpError(404, 'No hay cursos ocultos');
    }

    // 🔹 Registrar auditoría: un log por cada curso oculto
    for (const curso of cursos) {
      await AuditLog.createLog({
        actor: requester.id,
        target: curso._id, // asociamos log al curso específico
        targetModel: 'CursosRealizados',
        action: 'VIEW_HIDDEN_CURSO', // acción de auditoría
      });
    }

    return cursos;
  },
};
