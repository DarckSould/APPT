const mongoose = require('mongoose');
const validator = require('validator'); // para validar URLs y teléfonos

const VentaGarageSchema = new mongoose.Schema(
  {
    idperfilconqueestaactivo: {
      type: Number,
      ref: 'DatosPersonales',
      required: true,
      index: true,
    },

    nombreproducto: {
      type: String,
      maxlength: 100,
      trim: true,
      required: true,
    },

    estadoproducto: {
      type: String,
      enum: ['Bueno', 'Regular'],
      trim: true,
    },

    descripcion: {
      type: String,
      maxlength: 100,
      trim: true,
    },

    valordelbien: {
      type: Number,
      min: 0,
    },

    foto: {
      type: String,
      maxlength: 255,
      trim: true,
      validate: {
        validator: (v) =>
          !v || /^\/uploads\/fotos_venta\/.+\.(jpg|jpeg|png|gif)$/i.test(v),
        message: 'URL de la foto inválida',
      },
    },

    activarparaqueseveaenfront: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

/* =========================
   ÍNDICES
========================= */
VentaGarageSchema.index({
  idperfilconqueestaactivo: 1,
  nombreproducto: 1,
});

/* =========================
   VALIDACIONES DE NEGOCIO
========================= */
VentaGarageSchema.pre('save', async function () {
  // Normalizar
  if (this.nombreproducto) {
    this.nombreproducto = this.nombreproducto.trim();
  }

  /* ====== nombre obligatorio ====== */
  if (!this.nombreproducto || this.nombreproducto === '') {
    throw new Error('El nombre del producto es obligatorio');
  }

  /* ====== valor del bien ====== */
  if (this.valordelbien !== undefined) {
    if (this.valordelbien < 0) {
      throw new Error('El valor del bien no puede ser negativo');
    }

    if (this.valordelbien > 1000000) {
      throw new Error('El valor del bien es irreal');
    }
  }

  /* ====== evitar duplicados ====== */
  const existente = await this.constructor.findOne({
    _id: { $ne: this._id },
    idperfilconqueestaactivo: this.idperfilconqueestaactivo,
    nombreproducto: this.nombreproducto,
  });

  if (existente) {
    throw new Error('Ya existe un producto de venta de garage con este nombre');
  }

  /* ====== evitar registros vacíos ====== */
  if (
    !this.descripcion &&
    this.valordelbien === undefined &&
    !this.estadoproducto
  ) {
    throw new Error(
      'El producto no puede quedar vacío. Complete al menos un dato adicional.',
    );
  }
});

/* =========================
   MÉTODO PARA FRONT
========================= */
VentaGarageSchema.statics.obtenerParaFront = async function (idPerfil) {
  const productos = await this.find({
    idperfilconqueestaactivo: idPerfil,
    activarparaqueseveaenfront: true,
  }).sort({ nombreproducto: 1 });

  return productos.map((producto) => {
    const resultado = {};
    Object.keys(producto._doc).forEach((key) => {
      const valor = producto[key];
      if (valor !== null && valor !== undefined && valor !== '') {
        resultado[key] = valor;
      }
    });
    return resultado;
  });
};

module.exports = mongoose.model('VentaGarage', VentaGarageSchema);
