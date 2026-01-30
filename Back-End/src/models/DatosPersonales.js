const mongoose = require('mongoose');
const validator = require('validator'); // para validar URLs y teléfonos

const datosPersonalesSchema = new mongoose.Schema(
  {
    idperfil: {
      type: Number,
      required: true,
      unique: true,
    },
    descripcionperfil: {
      type: String,
      maxlength: 50,
      trim: true,
    },
    apellidos: {
      type: String,
      maxlength: 60,
      trim: true,
      required: true,
    },
    nombres: {
      type: String,
      maxlength: 60,
      trim: true,
      required: true,
    },
    nacionalidad: {
      type: String,
      maxlength: 50,
      trim: true,
    },
    lugarnacimiento: {
      type: String,
      maxlength: 100,
      trim: true,
    },
    fechanacimiento: {
      type: Date,
      required: true,
    },
    numerocedula: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{10}$/,
    },
    sexo: {
      type: String,
      required: true,
      enum: ['H', 'M'],
    },
    estadocivil: {
      type: String,
      enum: ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión Libre', 'Otro'],
      trim: true,
    },
    licenciaconducir: {
      type: String,
      enum: ['SI', 'NO'],
      default: 'NO',
      maxlength: 2,
    },
    telefonoconvencional: {
      type: String,
      maxlength: 20,
      validate: {
        validator: (v) =>
          !v ||
          validator.isMobilePhone(v.replace(/\+/g, ''), 'any') ||
          validator.isNumeric(v),
        message: 'Número de teléfono inválido',
      },
    },
    telefonofijo: {
      type: String,
      maxlength: 20,
      validate: {
        validator: (v) =>
          !v ||
          validator.isMobilePhone(v.replace(/\+/g, ''), 'any') ||
          validator.isNumeric(v),
        message: 'Número de teléfono inválido',
      },
    },
    direcciontrabajo: {
      type: String,
      maxlength: 150,
      trim: true,
    },
    direcciondomiciliaria: {
      type: String,
      maxlength: 150,
      trim: true,
    },
    sitioweb: {
      type: String,
      maxlength: 100,
      trim: true,
      validate: {
        validator: (v) => !v || validator.isURL(v, { require_protocol: false }),
        message: 'URL inválida',
      },
    },

    // Campo para la foto (ruta o URL)
    foto: {
      type: String,
      maxlength: 255,
      trim: true,
      validate: {
        validator: (v) =>
          !v || /^\/uploads\/fotos\/.+\.(jpg|jpeg|png|gif)$/i.test(v),
        message: 'URL de la foto inválida',
      },
    },

    // Campo para controlar visibilidad en frontend (soft delete)
    activarparaqueseveaenfront: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Validación: la fecha de nacimiento no puede ser futura ni mayor a 120 años
 */
datosPersonalesSchema.pre('validate', async function () {
  const hoy = new Date();
  if (this.fechanacimiento) {
    if (this.fechanacimiento > hoy) {
      throw new Error('La fecha de nacimiento no puede ser futura');
    }
    const edad = hoy.getFullYear() - this.fechanacimiento.getFullYear();
    if (edad > 120) {
      throw new Error('La edad no puede ser mayor a 120 años');
    }
  }
});

/**
 * Método para obtener los datos personales listos para frontend
 * Solo devuelve el perfil si está activo
 */
datosPersonalesSchema.statics.obtenerParaFront = async function (idPerfil) {
  const perfil = await this.findOne({
    idperfil: idPerfil,
    activarparaqueseveaenfront: true, // 🔹 solo activos
  }).lean();

  if (!perfil) return null;

  const resultado = {};
  Object.keys(perfil).forEach((key) => {
    const valor = perfil[key];
    if (valor !== null && valor !== undefined && valor !== '') {
      resultado[key] = valor;
    }
  });

  return resultado;
};

module.exports = mongoose.model('DatosPersonales', datosPersonalesSchema);
