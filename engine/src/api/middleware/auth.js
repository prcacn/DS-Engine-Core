// middleware/auth.js
// Valida que la petición incluye una API Key válida en el header X-API-Key

module.exports = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Header X-API-Key requerido'
    });
  }

  if (apiKey !== process.env.ENGINE_API_KEY) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'API Key inválida'
    });
  }

  next();
};
