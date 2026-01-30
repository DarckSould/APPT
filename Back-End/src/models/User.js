const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/roles');
const { USER_STATUS } = require('../config/userStatus');
const { MAX_LOGIN_ATTEMPTS, LOCK_TIME } = require('../config/security');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: { type: String, required: true },
    location: { type: String, required: true },
    password: { type: String, required: true },

    refreshToken: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.ADMIN,
    },

    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },

    // Seguridad
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // Bloqueo administrativo
    blockedAt: { type: Date },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    blockedReason: { type: String },

    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Hash password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Bloqueo automático
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Tiempo restante de bloqueo
userSchema.methods.getLockRemainingTime = function () {
  if (!this.lockUntil) return 0;
  const diff = this.lockUntil - Date.now();
  return Math.ceil(diff / 60000);
};

// Incrementar intentos de login
userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
  }

  if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
    this.lockUntil = Date.now() + LOCK_TIME;
    this.status = USER_STATUS.BLOCKED;
  }

  await this.save();
};

// Resetear intentos de login
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  this.status = USER_STATUS.ACTIVE;
  await this.save();
};

// Método para ocultar campos sensibles
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

// Asegurar que toJSON también oculte ambos
userSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
