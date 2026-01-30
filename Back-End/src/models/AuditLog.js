const mongoose = require('mongoose');

/**
 * Schema de logs de auditoría
 * Guarda quién hizo qué, sobre qué entidad y con qué cambios.
 */
const auditLogSchema = new mongoose.Schema(
  {
    // Quién realizó la acción
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    // Sobre qué entidad se realizó la acción
    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetModel', // populate dinámico según targetModel
      index: true,
    },

    targetModel: {
      type: String,
      required: true,
      enum: [
        'User',
        'DatosPersonales',
        'ExperienciaLaboral',
        'Reconocimiento',
        'CursosRealizados',
        'ProductosAcademicos',
        'ProductosLaborales',
        'VentaGarage',
        'Reconocimientos',
      ], // Modelos auditados
      index: true,
    },

    // Tipo de acción realizada
    action: {
      type: String,
      required: true,
      enum: [
        // ================= USER =================
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'ACCOUNT_LOCKED',
        'ACCOUNT_UNLOCKED',
        'UPDATE_PROFILE',
        'CHANGE_PASSWORD',
        'CREATE_USER',
        'UPDATE_USER',
        'DELETE_USER',
        'LOGOUT_USER',

        // ================= DATOS PERSONALES =================
        'CREATE_PERFIL',
        'UPDATE_PERFIL',
        'DELETE_PERFIL_PARTIAL',
        'DELETE_PERFIL_TOTAL',
        'HIDE_PERFIL',
        'RECOVER_PERFIL',
        'VIEW_HIDDEN_PERFIL',
        'UPDATE_FOTO_PERFIL',

        // ================= EXPERIENCIA LABORAL =================
        'CREATE_EXPERIENCIA',
        'UPDATE_EXPERIENCIA',
        'DELETE_EXPERIENCIA_PARTIAL',
        'DELETE_EXPERIENCIA_TOTAL',
        'DOWNLOAD_CERTIFICADO_EXPERIENCIA_PUBLICO',
        'HIDE_EXPERIENCIA',
        'RECOVER_EXPERIENCIA',
        'VIEW_HIDDEN_EXPERIENCIAS',

        // ================= RECONOCIMIENTOS =================
        'CREATE_RECONOCIMIENTO',
        'UPDATE_RECONOCIMIENTO',
        'DELETE_RECONOCIMIENTO_PARTIAL',
        'DELETE_RECONOCIMIENTO_TOTAL',
        'DOWNLOAD_CERTIFICADO_RECONOCIMIENTO_PUBLICO',
        'HIDE_RECONOCIMIENTO',
        'RECOVER_RECONOCIMIENTO',
        'VIEW_HIDDEN_RECONOCIMIENTOS',

        // ================= CURSOS REALIZADOS =================

        'CREATE_CURSO',
        'UPDATE_CURSO',
        'DELETE_CURSO_PARTIAL',
        'DELETE_CURSO_TOTAL',
        'DOWNLOAD_CERTIFICADO_CURSO_PUBLICO',
        'HIDE_CURSO',
        'RECOVER_CURSO',
        'VIEW_HIDDEN_CURSO',

        // ================= PRODUCTOS ACADÉMICOS =================
        'CREATE_PRODUCTO_ACADEMICO',
        'UPDATE_PRODUCTO_ACADEMICO',
        'HIDE_PRODUCTO_ACADEMICO',
        'RECOVER_PRODUCTO_ACADEMICO',
        'VIEW_HIDDEN_PRODUCTOS_ACADEMICOS',

        // ================= PRODUCTOS LABORALES =================
        'CREATE_PRODUCTO_LABORAL',
        'UPDATE_PRODUCTO_LABORAL',
        'HIDE_PRODUCTO_LABORAL',
        'RECOVER_PRODUCTO_LABORAL',
        'VIEW_HIDDEN_PRODUCTOS_LABORALES',

        // ================= VENTA GARAGE =================
        'CREATE_VENTA_GARAGE',
        'UPDATE_VENTA_GARAGE',
        'HIDE_VENTA_GARAGE',
        'RECOVER_VENTA_GARAGE',
        'VIEW_HIDDEN_VENTA_GARAGE',
      ],
      index: true,
      uppercase: true,
    },

    // Cambios realizados con historial detallado
    changes: [
      {
        field: { type: String, required: true },
        from: { type: mongoose.Schema.Types.Mixed, default: null },
        to: { type: mongoose.Schema.Types.Mixed, default: null },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Contexto de seguridad
    ipAddress: { type: String },
    userAgent: { type: String },

    // Metadata adicional flexible
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Ubicación geográfica opcional
    geoLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  {
    timestamps: true, // createdAt y updatedAt automáticos
    versionKey: false,
  },
);

/* =========================
   ÍNDICES COMPUESTOS
   ========================= */
auditLogSchema.index({ target: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, action: 1, createdAt: -1 });

/* =========================
   HELPER PARA CREAR LOGS
   ========================= */
auditLogSchema.statics.createLog = function ({
  actor = null,
  target,
  targetModel,
  action,
  changes = [],
  metadata = {},
  ipAddress,
  userAgent,
  geoLocation = { type: 'Point', coordinates: [0, 0] },
}) {
  return this.create({
    actor,
    target,
    targetModel,
    action,
    changes,
    metadata,
    ipAddress,
    userAgent,
    geoLocation,
  });
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
