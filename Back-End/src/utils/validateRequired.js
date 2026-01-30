const httpError = require('./httpError');

const validateRequired = (fields) => {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') {
      throw httpError(400, `El campo "${key}" es obligatorio`);
    }
  }
};

module.exports = validateRequired;
