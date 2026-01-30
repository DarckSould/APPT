const DatosPersonales = require('../models/DatosPersonales');
const AuditLog = require('../models/AuditLog');
const httpError = require('../utils/httpError');

const PERFIL_ID = 1;

module.exports = {
  /* =========================
     OBTENER PERFIL (público)
  ========================== */
  getPerfil: async () => {
    const perfil = await DatosPersonales.findOne({ idperfil: PERFIL_ID });
    if (!perfil) throw httpError(404, 'Perfil no encontrado');
    return perfil;
  },

  /* =========================
     CREAR O ACTUALIZAR PERFIL (Admin)
  ========================== */
  createOrUpdatePerfil: async ({ requester, data }) => {
    if (!requester || requester.role !== 'admin')
      throw httpError(403, 'No autorizado');

    let perfil = await DatosPersonales.findOne({ idperfil: PERFIL_ID });

    if (!perfil) {
      // Crear nuevo
      data.idperfil = PERFIL_ID;
      perfil = await DatosPersonales.create(data);

      await AuditLog.createLog({
        actor: requester.id,
        target: perfil._id,
        targetModel: 'DatosPersonales',
        action: 'CREATE_PERFIL',
      });
    } else {
      // Actualizar solo campos enviados
      const changes = [];
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== perfil[key]) {
          changes.push({ field: key, from: perfil[key], to: data[key] });
          perfil[key] = data[key];
        }
      });

      await perfil.save();

      if (changes.length) {
        await AuditLog.createLog({
          actor: requester.id,
          target: perfil._id,
          targetModel: 'DatosPersonales',
          action: 'UPDATE_PERFIL',
          changes,
        });
      }
    }

    return perfil;
  },

  /* =========================
     SUBIR O ACTUALIZAR FOTO (Admin)
  ========================== */
  updateFoto: async ({ requester, file }) => {
    if (!requester || requester.role !== 'admin')
      throw httpError(403, 'No autorizado');

    if (!file) throw httpError(400, 'No se subió ninguna foto');

    const perfil = await DatosPersonales.findOne({ idperfil: PERFIL_ID });
    if (!perfil) throw httpError(404, 'Perfil no encontrado');

    const oldFoto = perfil.foto;

    // Guardar la foto en la carpeta correcta y devolver ruta lista para Angular
    perfil.foto = `/uploads/fotos/${file.filename}`;

    await perfil.save();

    await AuditLog.createLog({
      actor: requester.id,
      target: perfil._id,
      targetModel: 'DatosPersonales',
      action: 'UPDATE_FOTO_PERFIL',
      changes: [{ field: 'foto', from: oldFoto, to: perfil.foto }],
    });

    return { message: 'Foto actualizada correctamente', foto: perfil.foto };
  },

  /* =========================
     ELIMINAR PERFIL (SOFT DELETE)
  ========================== */
  deletePerfil: async ({ requester }) => {
    if (!requester || requester.role !== 'admin')
      throw httpError(403, 'No autorizado');

    const perfil = await DatosPersonales.findOne({ idperfil: PERFIL_ID });
    if (!perfil) throw httpError(404, 'Perfil no encontrado');

    perfil.activarparaqueseveaenfront = false;
    await perfil.save();

    await AuditLog.createLog({
      actor: requester.id,
      target: perfil._id,
      targetModel: 'DatosPersonales',
      action: 'HIDE_PERFIL',
    });

    return { message: 'Perfil ocultado correctamente' };
  },

  /* =========================
     RECUPERAR PERFIL
  ========================== */
  recoverPerfil: async ({ requester }) => {
    if (!requester || requester.role !== 'admin')
      throw httpError(403, 'No autorizado');

    const perfil = await DatosPersonales.findOne({ idperfil: PERFIL_ID });
    if (!perfil) throw httpError(404, 'Perfil no encontrado');
    if (perfil.activarparaqueseveaenfront === true)
      throw httpError(400, 'El perfil ya está activo');

    perfil.activarparaqueseveaenfront = true;
    await perfil.save();

    await AuditLog.createLog({
      actor: requester.id,
      target: perfil._id,
      targetModel: 'DatosPersonales',
      action: 'RECOVER_PERFIL',
      changes: [{ field: 'activarparaqueseveaenfront', from: false, to: true }],
    });

    return { message: 'Perfil recuperado correctamente', perfil };
  },

  /* =========================
     LISTAR PERFIL OCULTO (SOLO ADMIN)
  ========================== */
  getHiddenPerfil: async ({ requester }) => {
    if (!requester || requester.role !== 'admin')
      throw httpError(403, 'No autorizado');

    const perfil = await DatosPersonales.findOne({
      idperfil: PERFIL_ID,
      activarparaqueseveaenfront: false,
    });

    if (!perfil) throw httpError(404, 'No hay perfil oculto');

    await AuditLog.createLog({
      actor: requester.id,
      target: perfil._id,
      targetModel: 'DatosPersonales',
      action: 'VIEW_HIDDEN_PERFIL',
    });

    return perfil;
  },
};
