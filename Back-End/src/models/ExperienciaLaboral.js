const mongoose = require('mongoose');
const validator = require('validator');

const ExperienciaLaboralSchema = new mongoose.Schema(
  {
    idperfilconqueestaactivo: {
      type: Number,
      ref: 'DatosPersonales',
      required: true,
      index: true,
    },

    cargodesempenado: { type: String, maxlength: 100, trim: true },
    nombrempresa: { type: String, maxlength: 50, trim: true, required: true },
    lugarempresa: { type: String, maxlength: 50, trim: true },
    emailempresa: {
      type: String,
      maxlength: 100,
      trim: true,
      validate: {
        validator: (v) => !v || validator.isEmail(v),
        message: 'Email inválido',
      },
    },
    sitiowebempresa: {
      type: String,
      maxlength: 100,
      trim: true,
      validate: {
        validator: (v) => !v || validator.isURL(v, { require_protocol: false }),
        message: 'URL inválida',
      },
    },
    nombrecontactoempresarial: { type: String, maxlength: 100, trim: true },
    telefonocontactoempresarial: {
      type: String,
      maxlength: 60,
      trim: true,
      validate: {
        validator: (v) => !v || validator.isMobilePhone(v, 'any'),
        message: 'Número de teléfono inválido',
      },
    },

    fechainiciogestion: { type: Date, required: true },
    fechafingestion: { type: Date }, // null = experiencia activa

    descripcionfunciones: { type: String, maxlength: 100, trim: true },
    activarparaqueseveaenfront: { type: Boolean, default: true },
    rutacertificado: { type: String, maxlength: 200, trim: true }, // aumentado por posibles rutas largas
  },
  { timestamps: true },
);

/* =========================
   ÍNDICE PARA CONSULTAS RÁPIDAS
========================= */
ExperienciaLaboralSchema.index({
  idperfilconqueestaactivo: 1,
  fechainiciogestion: -1,
});

/* =========================
   VALIDACIÓN DE FECHAS Y DUPLICADOS (HOOK CORREGIDO)
========================= */
ExperienciaLaboralSchema.pre('save', async function () {
  const inicio = this.fechainiciogestion;
  const fin = this.fechafingestion || new Date('2999-12-31');
  const hoy = new Date();

  // Límite: máximo 85 años atrás
  const limiteAntiguedad = new Date();
  limiteAntiguedad.setFullYear(hoy.getFullYear() - 85);

  if (!inicio) throw new Error('La fecha de inicio es obligatoria');
  if (inicio > hoy) throw new Error('La fecha de inicio no puede ser futura');
  if (inicio < limiteAntiguedad)
    throw new Error(
      'La fecha de inicio no puede ser anterior a 85 años desde la fecha actual',
    );

  if (this.fechafingestion && this.fechafingestion < inicio)
    throw new Error(
      'La fecha de fin no puede ser anterior a la fecha de inicio',
    );

  // Experiencias existentes en la misma empresa y perfil (excepto esta)
  const experiencias = await this.constructor.find({
    _id: { $ne: this._id },
    idperfilconqueestaactivo: this.idperfilconqueestaactivo,
    nombrempresa: this.nombrempresa,
  });

  // Experiencia activa única
  if (!this.fechafingestion) {
    const activaExistente = experiencias.find((exp) => !exp.fechafingestion);
    if (activaExistente)
      throw new Error(
        'Ya existe una experiencia activa en esta empresa. Finalízala antes de crear otra.',
      );
  }

  // Validar solapamiento de fechas
  const solapado = experiencias.some((exp) => {
    const expInicio = exp.fechainiciogestion;
    const expFin = exp.fechafingestion || new Date('2999-12-31');
    return inicio <= expFin && fin >= expInicio;
  });

  if (solapado)
    throw new Error(
      'Las fechas de esta experiencia se solapan con otra existente en la misma empresa.',
    );

  // Evitar duplicados exactos
  const existeDuplicado = experiencias.find(
    (exp) =>
      exp.cargodesempenado === this.cargodesempenado &&
      exp.fechainiciogestion.getTime() === inicio.getTime(),
  );

  if (existeDuplicado)
    throw new Error('Ya existe una experiencia idéntica en esta empresa.');
});

/* =========================
   MÉTODO PARA FRONT
========================= */
ExperienciaLaboralSchema.statics.obtenerParaFront = async function (idPerfil) {
  const experiencias = await this.find({
    idperfilconqueestaactivo: idPerfil,
    activarparaqueseveaenfront: true,
  }).sort({ fechafingestion: -1, fechainiciogestion: -1 });

  return experiencias.map((exp) => {
    const obj = exp.toObject();
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

module.exports = mongoose.model('ExperienciaLaboral', ExperienciaLaboralSchema);
