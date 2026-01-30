const service = require('../services/cursosRealizadosService');

/* =========================
   OBTENER CURSOS
========================= */
exports.getCursos = async (req, res, next) => {
  try {
    const cursos = await service.getCursos();
    res.json(cursos);
  } catch (e) {
    next(e);
  }
};

/* =========================
   CREAR CURSO
========================= */
exports.createCurso = async (req, res, next) => {
  try {
    const curso = await service.createCurso({
      requester: req.user,
      data: req.body,
      file: req.file,
    });
    res.status(201).json(curso);
  } catch (e) {
    next(e);
  }
};

/* =========================
   ACTUALIZAR CURSO
========================= */
exports.updateCurso = async (req, res, next) => {
  try {
    const curso = await service.updateCurso({
      requester: req.user,
      id: req.params.id,
      data: req.body,
      file: req.file,
    });
    res.json(curso);
  } catch (e) {
    next(e);
  }
};

/* =========================
   ELIMINAR CURSO (SOFT DELETE)
========================= */
exports.deleteCurso = async (req, res, next) => {
  try {
    const result = await service.deleteCurso({
      requester: req.user,
      id: req.params.id,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
};

/* =========================
   RECUPERAR CURSO
========================= */
exports.recoverCurso = async (req, res, next) => {
  try {
    const result = await service.recoverCurso({
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
   LISTAR CURSOS OCULTOS (SOLO ADMIN)
========================= */
exports.getHiddenCursos = async (req, res, next) => {
  try {
    const cursos = await service.getHiddenCursos({
      requester: req.user,
    });
    res.json(cursos);
  } catch (e) {
    next(e);
  }
};
