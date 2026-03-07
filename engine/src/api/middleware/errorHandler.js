// middleware/errorHandler.js
// Captura todos los errores no controlados y devuelve una respuesta JSON limpia

module.exports = (err, req, res, next) => {
  console.error('  ✗ Error:', err.message);

  const status  = err.status  || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    error: err.name || 'InternalError',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
