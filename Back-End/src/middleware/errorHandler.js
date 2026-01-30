const errorHandler = (err, req, res, next) => {
  // Mapa genérico de handlers
  const errorMap = {
    ValidationError: (e) => ({
      status: 400,
      message: Object.values(e.errors)
        .map((err) => err.message)
        .join(', '),
    }),
    CastError: (e) => ({ status: 400, message: `ID inválido: ${e.value}` }),
    TokenExpiredError: () => ({
      status: 401,
      message: 'Token expirado, inicie sesión de nuevo',
    }),
    JsonWebTokenError: () => ({ status: 401, message: 'Token inválido' }),
    MongoNetworkError: () => ({
      status: 503,
      message: 'No se pudo conectar a la base de datos',
    }),
    HttpError: (e) => ({ status: e.statusCode, message: e.message }),
    DuplicateKeyError: (e) => ({
      status: 400,
      message: `${Object.keys(e.keyValue)[0]} ya está registrado`,
    }),
  };

  // Determinar tipo de error
  const errorType = (() => {
    if (err.isHttpError) return 'HttpError';
    if (err.code === 11000) return 'DuplicateKeyError';
    return err.name;
  })();

  // Ejecutar handler si existe
  const handler = errorMap[errorType];
  const { status, message } = handler
    ? handler(err)
    : { status: 500, message: 'Error interno del servidor' };

  // Logs diferenciados
  if (status >= 500) {
    console.error(`[ERROR 500]: ${err.stack || err.message}`);
  } else if (status >= 400) {
    console.warn(`[WARN ${status}]: ${message}`);
  } else {
    console.log(`[INFO ${status}]: ${message}`);
  }

  res.status(status).json({ message });
};

module.exports = errorHandler;
