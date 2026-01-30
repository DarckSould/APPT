const service = require('../services/reconocimientoService');

/* =========================
   OBTENER RECONOCIMIENTOS
========================= */
exports.getReconocimientos = async (req, res, next) => {
  try {
    const reconocimientos = await service.getReconocimientos();
    res.json(reconocimientos);
  } catch (e) {
    next(e);
  }
};

/* =========================
   CREAR RECONOCIMIENTO
========================= */
exports.createReconocimiento = async (req, res, next) => {
  try {
    const reconocimiento = await service.createReconocimiento({
      requester: req.user,
      data: req.body,
      file: req.file,
    });
    res.status(201).json(reconocimiento);
  } catch (e) {
    next(e);
  }
};

/* =========================
   ACTUALIZAR RECONOCIMIENTO
========================= */
exports.updateReconocimiento = async (req, res, next) => {
  try {
    const reconocimiento = await service.updateReconocimiento({
      requester: req.user,
      id: req.params.id,
      data: req.body,
      file: req.file,
    });
    res.json(reconocimiento);
  } catch (e) {
    next(e);
  }
};

/* =========================
   ELIMINAR RECONOCIMIENTO (SOFT DELETE)
========================= */
exports.deleteReconocimiento = async (req, res, next) => {
  try {
    const result = await service.deleteReconocimiento({
      requester: req.user,
      id: req.params.id,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
};

/* =========================
   RECUPERAR RECONOCIMIENTO
========================= */
exports.recoverReconocimiento = async (req, res, next) => {
  try {
    const result = await service.recoverReconocimiento({
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
   LISTAR RECONOCIMIENTOS OCULTOS (SOLO ADMIN)
========================= */
exports.getHiddenReconocimientos = async (req, res, next) => {
  try {
    const reconocimientos = await service.getHiddenReconocimientos({
      requester: req.user,
    });
    res.json(reconocimientos);
  } catch (e) {
    next(e);
  }
};
