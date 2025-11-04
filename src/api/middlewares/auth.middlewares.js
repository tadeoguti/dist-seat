require('dotenv').config();
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];  // Acceso directo a los headers
  const token = authHeader && authHeader.split(' ')[1];  // Extraer token del encabezado
  if (token == null) return res.sendStatus(401);  // Si no hay token, retorno 401

  jwt.verify(token, process.env.SECRETKEY, (err, user) => {
    if (err) return res.sendStatus(403);  // Si el token es inválido, retorno 403
    req.user = user;  // Si el token es válido, agrego el usuario a la solicitud
    next();  // Continúo con el siguiente middleware o controlador
  });
}

// Exportar el middleware
module.exports = { authenticateToken };