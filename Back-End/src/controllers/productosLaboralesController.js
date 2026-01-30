const productosLaboralesService = require('../services/productosLaboralesService');

/* =========================
   OBTENER PRODUCTOS (PÚBLICO)
========================= */
exports.getProductos = async (req, res, next) => {
  try {
    const productos = await productosLaboralesService.getProductos();
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
    const producto = await productosLaboralesService.createProducto({
      requester: req.user,
      data: req.body,
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
    const producto = await productosLaboralesService.updateProducto({
      requester: req.user,
      id: req.params.id,
      data: req.body,
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
    const result = await productosLaboralesService.deleteProducto({
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
    const result = await productosLaboralesService.recoverProducto({
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
    const productos = await productosLaboralesService.getHiddenProductos({
      requester: req.user,
    });
    res.json(productos);
  } catch (err) {
    next(err);
  }
};
