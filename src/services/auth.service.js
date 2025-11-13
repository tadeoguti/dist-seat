//const express = require('express');
// const { generarToken } = require('../middlewares/auth.middlewares');
// const router = express.Router();

// router.post('/login', (req, res) => {
//   const { usuario, contraseña } = req.body;

//   // Simulación de validación
//   if (usuario === 'admin' && contraseña === '1234') {
//     const token = generarToken({ usuario });
//     res.json({ token });
//   } else {
//     res.status(401).json({ error: 'Credenciales inválidas' });
//   }
// });

// module.exports = router;


const { generarToken } = require('../middlewares/auth.middlewares');

const loginService = (usuario, password) => {
  // Simulación de validación
  if (usuario === 'admin' && password === '1234') {
    return generarToken({ usuario });
  } else {
    throw new Error('Credenciales inválidas');
  }
};

module.exports = { loginService };
