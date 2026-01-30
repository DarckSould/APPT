const mongoose = require('mongoose');
const validator = require('validator');

const CursosRealizadosSchema = new mongoose.Schema(
  {
    idperfilconqueestaactivo: {
      type: Number,
      ref: 'DatosPersonales',
      required: true,
      index: true,
    },

    nombrecurso: {
      type: String,
      maxlength: 100,
      trim: true,
      required: true,
    },

    fechainicio: { type: Date, required: true },
    fechafin: { type: Date }, // null = curso en progreso

    totalhoras: {
      type: Number,
      min: [1, 'El total de horas debe ser mayor a 0'],
    },

    descripcioncurso: { type: String, maxlength: 100, trim: true },
    entidadpatrocinadora: { type: String, maxlength: 100, trim: true },

    nombrecontactoauspicia: { type: String, maxlength: 100, trim: true },

    telefonocontactoauspicia: {
      type: String,
      maxlength: 60,
      trim: true,
      validate: {
        validator: (v) => !v || validator.isMobilePhone(v, 'any'),
        message: 'Número de teléfono inválido',
      },
    },

    emailempresapatrocinadora: {
      type: String,
      maxlength: 60,
      trim: true,
      validate: {
        validator: (v) => !v || validator.isEmail(v),
        message: 'Email inválido',
      },
    },

    activarparaqueseveaenfront: { type: Boolean, default: true },
    rutacertificado: { type: String, maxlength: 100, trim: true },
  },
  { timestamps: true },
);

/* =========================
   ÍNDICE PARA CONSULTAS
========================= */
CursosRealizadosSchema.index({
  idperfilconqueestaactivo: 1,
  nombrecurso: 1,
  fechainicio: -1,
});

/* =========================
   VALIDACIONES REALES (HOOK)
========================= */
CursosRealizadosSchema.pre('save', async function () {
  const inicio = this.fechainicio;
  const fin = this.fechafin || new Date('2999-12-31');
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

  if (this.fechafin && this.fechafin < inicio)
    throw new Error(
      'La fecha de fin no puede ser anterior a la fecha de inicio',
    );

  // Cursos existentes del mismo perfil (excepto este)
  const cursos = await this.constructor.find({
    _id: { $ne: this._id },
    idperfilconqueestaactivo: this.idperfilconqueestaactivo,
    nombrecurso: this.nombrecurso,
    entidadpatrocinadora: this.entidadpatrocinadora,
  });

  // Evitar solapamiento del mismo curso
  const solapado = cursos.some((curso) => {
    const cInicio = curso.fechainicio;
    const cFin = curso.fechafin || new Date('2999-12-31');
    return inicio <= cFin && fin >= cInicio;
  });

  if (solapado)
    throw new Error('Este curso se solapa con otro registro existente.');

  // Evitar duplicado exacto
  const duplicado = cursos.find(
    (curso) => curso.fechainicio.getTime() === inicio.getTime(),
  );

  if (duplicado) throw new Error('Ya existe un curso idéntico registrado.');
});

/* =========================
   MÉTODO PARA FRONT
========================= */
CursosRealizadosSchema.statics.obtenerParaFront = async function (idPerfil) {
  const cursos = await this.find({
    idperfilconqueestaactivo: idPerfil,
    activarparaqueseveaenfront: true,
  }).sort({ nombrecurso: 1, fechainicio: 1 });

  return cursos.map((curso) => {
    const obj = curso.toObject();
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

module.exports = mongoose.model('CursosRealizados', CursosRealizadosSchema);
