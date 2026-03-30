const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'tu_clave_secreta';

// Generar token
function generarToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '15m' });
}

module.exports = { generarToken };