const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'tu_clave_secreta';

// Generar token
function generarToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
}

// Verificar token (middleware)
function verificarToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.usuario = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { generarToken, verificarToken };
