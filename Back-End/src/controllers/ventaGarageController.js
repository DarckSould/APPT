const ventaGarageService = require('../services/ventaGarageService');

/* =========================
   OBTENER PRODUCTOS (PÚBLICO)
========================= */
exports.getProductos = async (req, res, next) => {
  try {
    const productos = await ventaGarageService.getProductos();
    res.json(productos);
  } catch (err) {
    next(err);
  }
};

/* =========================
   CREAR PRODUCTO (ADMIN)
========================= */
exports.createProducto = async (req, res, next) => {
  try {
    const producto = await ventaGarageService.createProducto({
      requester: req.user,
      data: req.body,
      file: req.file, // si hay archivo de foto, multer lo pone aquí
    });
    res.status(201).json(producto);
  } catch (err) {
    next(err);
  }
};

/* =========================
   ACTUALIZAR PRODUCTO (ADMIN)
========================= */
exports.updateProducto = async (req, res, next) => {
  try {
    const producto = await ventaGarageService.updateProducto({
      requester: req.user,
      id: req.params.id,
      data: req.body,
      file: req.file, // si hay archivo de foto, se actualiza también
    });
    res.json(producto);
  } catch (err) {
    next(err);
  }
};

/* =========================
   OCULTAR PRODUCTO (SOFT DELETE)
========================= */
exports.deleteProducto = async (req, res, next) => {
  try {
    const result = await ventaGarageService.deleteProducto({
      requester: req.user,
      id: req.params.id,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/* =========================
   RECUPERAR PRODUCTO
========================= */
exports.recoverProducto = async (req, res, next) => {
  try {
    const result = await ventaGarageService.recoverProducto({
      requester: req.user,
      id: req.params.id,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/* =========================
   LISTAR PRODUCTOS OCULTOS (solo admin)
========================= */
exports.getHiddenProductos = async (req, res, next) => {
  try {
    const productos = await ventaGarageService.getHiddenProductos({
      requester: req.user,
    });
    res.json(productos);
  } catch (err) {
    next(err);
  }
};

/* =========================
   ACTUALIZAR SOLO FOTO DE PRODUCTO
========================= */
exports.updateFotoProducto = async (req, res, next) => {
  try {
    const result = await ventaGarageService.updateProductoFoto({
      requester: req.user,
      id: req.params.id,
      file: req.file,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
