const datosPersonalesService = require('../services/datosPersonalesService');

/* =========================
   OBTENER PERFIL (público)
========================= */
exports.getPerfil = async (req, res, next) => {
  try {
    const perfil = await datosPersonalesService.getPerfil();
    res.json(perfil);
  } catch (error) {
    next(error);
  }
};

/* =========================
   CREAR O ACTUALIZAR PERFIL (Admin)
========================= */
exports.createOrUpdatePerfil = async (req, res, next) => {
  try {
    const perfil = await datosPersonalesService.createOrUpdatePerfil({
      requester: req.user,
      data: req.body,
    });
    res.json(perfil);
  } catch (error) {
    next(error);
  }
};

/* =========================
   SUBIR / ACTUALIZAR FOTO DE PERFIL
========================= */
exports.updateFotoPerfil = async (req, res, next) => {
  try {
    const perfil = await datosPersonalesService.updateFoto({
      requester: req.user,
      file: req.file,
    });
    res.json(perfil); // 🔹 enviar directamente lo que devuelve el service
  } catch (error) {
    next(error);
  }
};

/* =========================
   OCULTAR PERFIL (SOFT DELETE)
========================= */
exports.deletePerfil = async (req, res, next) => {
  try {
    const result = await datosPersonalesService.deletePerfil({
      requester: req.user,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/* =========================
   RECUPERAR PERFIL
========================= */
exports.recoverPerfil = async (req, res, next) => {
  try {
    const result = await datosPersonalesService.recoverPerfil({
      requester: req.user,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/* =========================
   LISTAR PERFIL OCULTO (solo admin)
========================= */
exports.getHiddenPerfil = async (req, res, next) => {
  try {
    const perfil = await datosPersonalesService.getHiddenPerfil({
      requester: req.user,
    });
    res.json(perfil);
  } catch (error) {
    next(error);
  }
};
