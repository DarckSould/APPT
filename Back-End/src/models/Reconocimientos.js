const mongoose = require('mongoose');

const ReconocimientoSchema = new mongoose.Schema(
  {
    idperfilconqueestaactivo: {
      type: Number, // coincide con idperfil de DatosPersonales
      ref: 'DatosPersonales',
      required: true,
    },
    tiporeconocimiento: {
      type: String,
      enum: ['Académico', 'Público', 'Privado'],
      required: true,
      trim: true,
    },
    fechareconocimiento: { type: Date },
    descripcionreconocimiento: { type: String, maxlength: 100, trim: true },
    entidadpatrocinadora: { type: String, maxlength: 100, trim: true },
    nombrecontactoauspicia: { type: String, maxlength: 100, trim: true },
    telefonocontactoauspicia: { type: String, maxlength: 60, trim: true },
    activarparaqueseveaenfront: { type: Boolean, default: true },
    rutacertificado: { type: String, maxlength: 100, trim: true },
  },
  {
    timestamps: true, // createdAt y updatedAt
  },
);

/* =========================
   VALIDACIÓN DE FECHA
========================= */
ReconocimientoSchema.pre('validate', async function () {
  if (this.fechareconocimiento) {
    const hoy = new Date();

    // Límite: máximo 85 años atrás
    const limiteAntiguedad = new Date();
    limiteAntiguedad.setFullYear(hoy.getFullYear() - 85);

    if (this.fechareconocimiento > hoy) {
      throw new Error('La fecha de reconocimiento no puede ser futura');
    }

    if (this.fechareconocimiento < limiteAntiguedad) {
      throw new Error(
        'La fecha de reconocimiento no puede ser anterior a 85 años desde la fecha actual',
      );
    }
  }
});

/* =========================
   VALIDACIÓN DE UNICIDAD
========================= */
ReconocimientoSchema.pre('save', async function () {
  const filtro = {
    _id: { $ne: this._id }, // excluye este documento si es update
    idperfilconqueestaactivo: this.idperfilconqueestaactivo,
    tiporeconocimiento: this.tiporeconocimiento,
    descripcionreconocimiento: this.descripcionreconocimiento,
    fechareconocimiento: this.fechareconocimiento,
  };

  const existe = await this.constructor.findOne(filtro);
  if (existe) {
    throw new Error('Ya existe un reconocimiento idéntico para este perfil');
  }
});

/* =========================
   MÉTODO PARA FRONT
========================= */
ReconocimientoSchema.statics.obtenerParaFront = async function (idPerfil) {
  const reconocimientos = await this.find({
    idperfilconqueestaactivo: idPerfil,
    activarparaqueseveaenfront: true,
  }).sort({ tiporeconocimiento: 1, fechareconocimiento: 1 });

  // Filtra campos vacíos
  return reconocimientos.map((rec) => {
    const resultado = {};
    Object.keys(rec._doc).forEach((key) => {
      const valor = rec[key];
      if (valor !== null && valor !== undefined && valor !== '') {
        resultado[key] = valor;
      }
    });
    return resultado;
  });
};

module.exports = mongoose.model('Reconocimiento', ReconocimientoSchema);
