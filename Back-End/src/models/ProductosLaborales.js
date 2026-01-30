const mongoose = require('mongoose');

const ProductosLaboralesSchema = new mongoose.Schema(
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

    fechaproducto: {
      type: Date,
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
ProductosLaboralesSchema.index({
  idperfilconqueestaactivo: 1,
  nombreproducto: 1,
  fechaproducto: 1,
});

/* =========================
   VALIDACIONES REALES (HOOK)
========================= */
ProductosLaboralesSchema.pre('save', async function () {
  this.nombreproducto = this.nombreproducto?.trim();

  if (!this.nombreproducto) {
    throw new Error('El nombre del producto laboral es obligatorio');
  }

  // Validar fecha (no futura y no mayor a 85 años)
  if (this.fechaproducto) {
    const hoy = new Date();

    const limiteAntiguedad = new Date();
    limiteAntiguedad.setFullYear(hoy.getFullYear() - 85);

    if (this.fechaproducto > hoy) {
      throw new Error('La fecha del producto laboral no puede ser futura');
    }

    if (this.fechaproducto < limiteAntiguedad) {
      throw new Error(
        'La fecha del producto laboral no puede ser anterior a 85 años desde la fecha actual',
      );
    }
  }

  // Buscar productos del mismo perfil (excepto este)
  const existentes = await this.constructor.find({
    _id: { $ne: this._id },
    idperfilconqueestaactivo: this.idperfilconqueestaactivo,
    nombreproducto: this.nombreproducto,
  });

  // Evitar duplicado exacto (nombre + fecha)
  const duplicado = existentes.find(
    (prod) =>
      (!prod.fechaproducto && !this.fechaproducto) ||
      (prod.fechaproducto &&
        this.fechaproducto &&
        prod.fechaproducto.getTime() === this.fechaproducto.getTime()),
  );

  if (duplicado) {
    throw new Error(
      'Ya existe un producto laboral con el mismo nombre y fecha.',
    );
  }
});

/* =========================
   MÉTODO PARA FRONT
========================= */
ProductosLaboralesSchema.statics.obtenerParaFront = async function (idPerfil) {
  const productos = await this.find({
    idperfilconqueestaactivo: idPerfil,
    activarparaqueseveaenfront: true,
  }).sort({ nombreproducto: 1, fechaproducto: 1 });

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

module.exports = mongoose.model('ProductosLaborales', ProductosLaboralesSchema);
