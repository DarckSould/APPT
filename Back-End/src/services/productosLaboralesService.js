const ProductosLaborales = require('../models/ProductosLaborales');
const AuditLog = require('../models/AuditLog');
const httpError = require('../utils/httpError');

const PERFIL_ID = 1;

/* =========================
   OBTENER PRODUCTOS (PÚBLICO)
========================= */
exports.getProductos = async () => {
  return await ProductosLaborales.obtenerParaFront(PERFIL_ID);
};

/* =========================
   CREAR PRODUCTO (ADMIN)
========================= */
exports.createProducto = async ({ requester, data }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  if (!data.nombreproducto || data.nombreproducto.trim() === '') {
    throw httpError(400, 'El nombre del producto es obligatorio');
  }

  if (data.fechaproducto && new Date(data.fechaproducto) > new Date()) {
    throw httpError(400, 'La fecha del producto no puede ser futura');
  }

  const producto = await ProductosLaborales.create({
    ...data,
    idperfilconqueestaactivo: PERFIL_ID,
    activarparaqueseveaenfront: true,
  });

  await AuditLog.createLog({
    actor: requester.id,
    target: producto._id,
    targetModel: 'ProductosLaborales',
    action: 'CREATE_PRODUCTO_LABORAL',
  });

  return producto;
};

/* =========================
   ACTUALIZAR PRODUCTO (ADMIN)
========================= */
exports.updateProducto = async ({ requester, id, data }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const producto = await ProductosLaborales.findById(id);
  if (!producto) throw httpError(404, 'Producto no encontrado');

  const changes = [];

  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== producto[key]) {
      changes.push({ field: key, from: producto[key], to: data[key] });
      producto[key] = data[key];
    }
  });

  if (data.fechaproducto && new Date(data.fechaproducto) > new Date()) {
    throw httpError(400, 'La fecha del producto no puede ser futura');
  }

  await producto.save();

  if (changes.length) {
    await AuditLog.createLog({
      actor: requester.id,
      target: producto._id,
      targetModel: 'ProductosLaborales',
      action: 'UPDATE_PRODUCTO_LABORAL',
      changes,
    });
  }

  return producto;
};

/* =========================
   OCULTAR PRODUCTO (SOFT DELETE)
========================= */
exports.deleteProducto = async ({ requester, id }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const producto = await ProductosLaborales.findById(id);
  if (!producto) throw httpError(404, 'Producto no encontrado');

  if (producto.activarparaqueseveaenfront === false) {
    throw httpError(400, 'El producto ya está oculto');
  }

  producto.activarparaqueseveaenfront = false;
  await producto.save();

  await AuditLog.createLog({
    actor: requester.id,
    target: producto._id,
    targetModel: 'ProductosLaborales',
    action: 'HIDE_PRODUCTO_LABORAL',
    changes: [{ field: 'activarparaqueseveaenfront', from: true, to: false }],
  });

  return { message: 'Producto laboral ocultado correctamente' };
};

/* =========================
   RECUPERAR PRODUCTO
========================= */
exports.recoverProducto = async ({ requester, id }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const producto = await ProductosLaborales.findById(id);
  if (!producto) throw httpError(404, 'Producto no encontrado');

  if (producto.activarparaqueseveaenfront === true) {
    throw httpError(400, 'El producto ya está activo');
  }

  producto.activarparaqueseveaenfront = true;
  await producto.save();

  await AuditLog.createLog({
    actor: requester.id,
    target: producto._id,
    targetModel: 'ProductosLaborales',
    action: 'RECOVER_PRODUCTO_LABORAL',
    changes: [{ field: 'activarparaqueseveaenfront', from: false, to: true }],
  });

  return { message: 'Producto laboral recuperado correctamente', producto };
};

/* =========================
   LISTAR PRODUCTOS OCULTOS (solo admin)
========================= */
exports.getHiddenProductos = async ({ requester }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const productos = await ProductosLaborales.find({
    idperfilconqueestaactivo: PERFIL_ID,
    activarparaqueseveaenfront: false,
  }).sort({ createdAt: -1 });

  if (!productos || productos.length === 0) {
    throw httpError(404, 'No hay productos laborales ocultos');
  }

  for (const producto of productos) {
    await AuditLog.createLog({
      actor: requester.id,
      target: producto._id,
      targetModel: 'ProductosLaborales',
      action: 'VIEW_HIDDEN_PRODUCTOS_LABORALES',
    });
  }

  return productos;
};
