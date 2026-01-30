const mongoose = require('mongoose');

const ProductosAcademicosSchema = new mongoose.Schema(
  {
    idperfilconqueestaactivo: {
      type: Number,
      ref: 'DatosPersonales',
      required: true,
      index: true,
    },

    nombrerecurso: {
      type: String,
      maxlength: 100,
      trim: true,
      required: true,
    },

    clasificador: {
      type: String,
      maxlength: 100,
      trim: true,
    },

    descripcion: {
      type: String,
      maxlength: 100,
      trim: true,
    },

    activarparaqueseveaenfront: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

/* =========================
   ÍNDICE PARA DUPLICADOS
========================= */
ProductosAcademicosSchema.index({
  idperfilconqueestaactivo: 1,
  nombrerecurso: 1,
  clasificador: 1,
});

/* =========================
   VALIDACIONES REALES (HOOK)
========================= */
ProductosAcademicosSchema.pre('save', async function () {
  // Normalización mínima
  this.nombrerecurso = this.nombrerecurso?.trim();

  if (!this.nombrerecurso) {
    throw new Error('El nombre del recurso es obligatorio');
  }

  // Buscar productos del mismo perfil (excepto este)
  const existentes = await this.constructor.find({
    _id: { $ne: this._id },
    idperfilconqueestaactivo: this.idperfilconqueestaactivo,
    nombrerecurso: this.nombrerecurso,
  });

  // Evitar duplicado exacto (nombre + clasificador)
  const duplicado = existentes.find(
    (prod) => (prod.clasificador || '') === (this.clasificador || ''),
  );

  if (duplicado) {
    throw new Error(
      'Ya existe un producto académico con el mismo nombre y clasificador.',
    );
  }
});

/* =========================
   MÉTODO PARA FRONT
========================= */
ProductosAcademicosSchema.statics.obtenerParaFront = async function (idPerfil) {
  const productos = await this.find({
    idperfilconqueestaactivo: idPerfil,
    activarparaqueseveaenfront: true,
  }).sort({ nombrerecurso: 1 });

  return productos.map((producto) => {
    const obj = producto.toObject();
    const resultado = {};

    Object.keys(obj).forEach((key) => {
      const valor = obj[key];
      if (valor !== null && valor !== undefined && valor !== '') {
        resultado[key] = valor;
      }
    });

    return resultado;
  });
};

module.exports = mongoose.model(
  'ProductosAcademicos',
  ProductosAcademicosSchema,
);
