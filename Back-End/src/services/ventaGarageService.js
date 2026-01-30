const VentaGarage = require('../models/VentaGarage');
const AuditLog = require('../models/AuditLog');
const httpError = require('../utils/httpError');
const fs = require('fs');
const path = require('path');

const PERFIL_ID = 1;

/* =========================
   OBTENER PRODUCTOS (PÚBLICO)
========================= */
exports.getProductos = async () => {
  return await VentaGarage.obtenerParaFront(PERFIL_ID);
};

/* =========================
   CREAR PRODUCTO (ADMIN)
========================= */
exports.createProducto = async ({ requester, data, file }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  data = data || {};

  // Validación de campo obligatorio
  const requiredFields = ['nombreproducto'];
  const missingFields = requiredFields.filter((field) => !data[field]);
  if (missingFields.length > 0) {
    throw httpError(
      400,
      `Faltan campos obligatorios: ${missingFields.join(', ')}`,
    );
  }

  // Mapear "precio" a "valordelbien"
  if (data.precio !== undefined && data.valordelbien === undefined) {
    data.valordelbien = Number(data.precio);
  }

  // Asignaciones automáticas
  data.idperfilconqueestaactivo = PERFIL_ID;
  data.activarparaqueseveaenfront = true;

  // Foto si viene
  if (file) {
    data.foto = `/uploads/fotos_venta/${file.filename}`;
  }

  try {
    const producto = await VentaGarage.create(data);

    await AuditLog.createLog({
      actor: requester.id,
      target: producto._id,
      targetModel: 'VentaGarage',
      action: 'CREATE_VENTA_GARAGE',
    });

    return producto;
  } catch (err) {
    throw httpError(400, err.message);
  }
};

/* =========================
   ACTUALIZAR PRODUCTO (ADMIN)
========================= */
exports.updateProducto = async ({ requester, id, data, file }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const producto = await VentaGarage.findById(id);
  if (!producto) throw httpError(404, 'Producto no encontrado');

  data = data || {};

  // Mapear "precio" a "valordelbien"
  if (data.precio !== undefined) {
    data.valordelbien = Number(data.precio);
  }

  const changes = [];
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== producto[key]) {
      changes.push({ field: key, from: producto[key], to: data[key] });
      producto[key] = data[key];
    }
  });

  // Actualizar foto si viene
  if (file) {
    const oldFoto = producto.foto;
    producto.foto = `/uploads/fotos_venta/${file.filename}`;
    changes.push({ field: 'foto', from: oldFoto, to: producto.foto });
  }

  try {
    await producto.save();

    if (changes.length) {
      await AuditLog.createLog({
        actor: requester.id,
        target: producto._id,
        targetModel: 'VentaGarage',
        action: 'UPDATE_VENTA_GARAGE',
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

  const producto = await VentaGarage.findById(id);
  if (!producto) throw httpError(404, 'Producto no encontrado');

  if (producto.activarparaqueseveaenfront === false) {
    throw httpError(400, 'El producto ya está oculto');
  }

  producto.activarparaqueseveaenfront = false;
  await producto.save();

  await AuditLog.createLog({
    actor: requester.id,
    target: producto._id,
    targetModel: 'VentaGarage',
    action: 'HIDE_VENTA_GARAGE',
    changes: [{ field: 'activarparaqueseveaenfront', from: true, to: false }],
  });

  return { message: 'Producto ocultado correctamente' };
};

/* =========================
   RECUPERAR PRODUCTO
========================= */
exports.recoverProducto = async ({ requester, id }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const producto = await VentaGarage.findById(id);
  if (!producto) throw httpError(404, 'Producto no encontrado');

  if (producto.activarparaqueseveaenfront === true) {
    throw httpError(400, 'El producto ya está activo');
  }

  producto.activarparaqueseveaenfront = true;
  await producto.save();

  await AuditLog.createLog({
    actor: requester.id,
    target: producto._id,
    targetModel: 'VentaGarage',
    action: 'RECOVER_VENTA_GARAGE',
    changes: [{ field: 'activarparaqueseveaenfront', from: false, to: true }],
  });

  return { message: 'Producto recuperado correctamente', producto };
};

/* =========================
   LISTAR PRODUCTOS OCULTOS (solo admin)
========================= */
exports.getHiddenProductos = async ({ requester }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  const productos = await VentaGarage.find({
    idperfilconqueestaactivo: PERFIL_ID,
    activarparaqueseveaenfront: false,
  }).sort({ createdAt: -1 });

  if (!productos || productos.length === 0) {
    throw httpError(404, 'No hay productos ocultos');
  }

  for (const producto of productos) {
    await AuditLog.createLog({
      actor: requester.id,
      target: producto._id,
      targetModel: 'VentaGarage',
      action: 'VIEW_HIDDEN_VENTA_GARAGE',
    });
  }

  return productos;
};

/* =========================
   ACTUALIZAR SOLO FOTO DE PRODUCTO (ADMIN)
========================= */
exports.updateProductoFoto = async ({ requester, id, file }) => {
  if (!requester || requester.role !== 'admin') {
    throw httpError(403, 'No autorizado');
  }

  if (!file) {
    throw httpError(400, 'No se subió ninguna foto');
  }

  const producto = await VentaGarage.findById(id);
  if (!producto) throw httpError(404, 'Producto no encontrado');

  const oldFoto = producto.foto;
  producto.foto = `/uploads/fotos_venta/${file.filename}`;

  try {
    await producto.save();

    await AuditLog.createLog({
      actor: requester.id,
      target: producto._id,
      targetModel: 'VentaGarage',
      action: 'UPDATE_FOTO_VENTA_GARAGE',
      changes: [{ field: 'foto', from: oldFoto, to: producto.foto }],
    });

    return { message: 'Foto actualizada correctamente', producto };
  } catch (err) {
    throw httpError(400, err.message);
  }
};
