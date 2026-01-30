const ProductosAcademicos = require('../models/ProductosAcademicos');
const AuditLog = require('../models/AuditLog');
const httpError = require('../utils/httpError');

const PERFIL_ID = 1;

/* =========================
   OBTENER PRODUCTOS (PÚBLICO)
========================= */
exports.getProductos = async () => {
  return await ProductosAcademicos.obtenerParaFront(PERFIL_ID);
};

/* =========================
   CREAR PRODUCTO (ADMIN)
========================= */
exports.createProducto = async ({ requester, data }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  data.idperfilconqueestaactivo = PERFIL_ID;

  try {
    const producto = await ProductosAcademicos.create(data);

    await AuditLog.createLog({
      actor: requester.id,
      target: producto._id,
      targetModel: 'ProductosAcademicos',
      action: 'CREATE_PRODUCTO_ACADEMICO',
    });

    return producto;
  } catch (err) {
    throw httpError(400, err.message);
  }
};

/* =========================
   ACTUALIZAR PRODUCTO (ADMIN)
========================= */
exports.updateProducto = async ({ requester, id, data }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const producto = await ProductosAcademicos.findById(id);
  if (!producto) throw httpError(404, 'Producto académico no encontrado');

  const changes = [];

  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== producto[key]) {
      changes.push({ field: key, from: producto[key], to: data[key] });
      producto[key] = data[key];
    }
  });

  try {
    await producto.save();

    if (changes.length) {
      await AuditLog.createLog({
        actor: requester.id,
        target: producto._id,
        targetModel: 'ProductosAcademicos',
        action: 'UPDATE_PRODUCTO_ACADEMICO',
        changes,
      });
    }

    return producto;
  } catch (err) {
    throw httpError(400, err.message);
  }
};

/* =========================
   OCULTAR PRODUCTO (SOFT DELETE)
========================= */
exports.deleteProducto = async ({ requester, id }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const producto = await ProductosAcademicos.findById(id);
  if (!producto) throw httpError(404, 'Producto académico no encontrado');

  producto.activarparaqueseveaenfront = false;
  await producto.save();

  await AuditLog.createLog({
    actor: requester.id,
    target: producto._id,
    targetModel: 'ProductosAcademicos',
    action: 'HIDE_PRODUCTO_ACADEMICO',
  });

  return { message: 'Producto académico ocultado correctamente' };
};

/* =========================
   RECUPERAR PRODUCTO
========================= */
exports.recoverProducto = async ({ requester, id }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const producto = await ProductosAcademicos.findById(id);
  if (!producto) throw httpError(404, 'Producto académico no encontrado');

  if (producto.activarparaqueseveaenfront === true) {
    throw httpError(400, 'El producto académico ya está activo');
  }

  producto.activarparaqueseveaenfront = true;
  await producto.save();

  await AuditLog.createLog({
    actor: requester.id,
    target: producto._id,
    targetModel: 'ProductosAcademicos',
    action: 'RECOVER_PRODUCTO_ACADEMICO',
    changes: [{ field: 'activarparaqueseveaenfront', from: false, to: true }],
  });

  return { message: 'Producto académico recuperado correctamente', producto };
};

/* =========================
   LISTAR PRODUCTOS OCULTOS (solo admin)
========================= */
exports.getHiddenProductos = async ({ requester }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const productos = await ProductosAcademicos.find({
    idperfilconqueestaactivo: PERFIL_ID,
    activarparaqueseveaenfront: false,
  }).sort({ createdAt: -1 });

  if (!productos || productos.length === 0) {
    throw httpError(404, 'No hay productos académicos ocultos');
  }

  for (const producto of productos) {
    await AuditLog.createLog({
      actor: requester.id,
      target: producto._id,
      targetModel: 'ProductosAcademicos',
      action: 'VIEW_HIDDEN_PRODUCTOS_ACADEMICOS',
    });
  }

  return productos;
};
