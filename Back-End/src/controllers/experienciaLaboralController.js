const service = require('../services/experienciaLaboralService');

/* =========================
   OBTENER EXPERIENCIAS
========================= */
exports.getExperiencias = async (req, res, next) => {
  try {
    const experiencias = await service.getExperiencias();
    res.json(experiencias);
  } catch (e) {
    next(e);
  }
};

/* =========================
   CREAR EXPERIENCIA
========================= */
exports.createExperiencia = async (req, res, next) => {
  try {
    const experiencia = await service.createExperiencia({
      requester: req.user,
      data: req.body,
      file: req.file,
    });
    res.status(201).json(experiencia);
  } catch (e) {
    next(e);
  }
};

/* =========================
   ACTUALIZAR EXPERIENCIA
========================= */
exports.updateExperiencia = async (req, res, next) => {
  try {
    const experiencia = await service.updateExperiencia({
      requester: req.user,
      id: req.params.id,
      data: req.body,
      file: req.file,
    });
    res.json(experiencia);
  } catch (e) {
    next(e);
  }
};

/* =========================
   ELIMINAR EXPERIENCIA (SOFT DELETE)
========================= */
exports.deleteExperiencia = async (req, res, next) => {
  try {
    const result = await service.deleteExperiencia({
      requester: req.user,
      id: req.params.id,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
};

/* =========================
   RECUPERAR EXPERIENCIA
========================= */
exports.recoverExperiencia = async (req, res, next) => {
  try {
    const result = await service.recoverExperiencia({
      requester: req.user,
      id: req.params.id,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
};

/* =========================
   OBTENER CERTIFICADO PÚBLICO
========================= */
exports.obtenerCertificadoPublico = async (req, res, next) => {
  try {
    const { ruta, nombre } = await service.obtenerCertificadoPublico({
      id: req.params.id,
    });
    res.download(ruta, nombre);
  } catch (e) {
    next(e);
  }
};

/* =========================
   LISTAR EXPERIENCIAS OCULTAS (SOLO ADMIN)
========================= */
exports.getHiddenExperiencias = async (req, res, next) => {
  try {
    const experiencias = await service.getHiddenExperiencias({
      requester: req.user,
    });
    res.json(experiencias);
  } catch (e) {
    next(e);
  }
};
