// const { generarToken } = require('../middlewares/auth.middlewares');

// const loginController = (req, res) => {
//   const { usuario, contraseña } = req.body;

//   // Simulación de validación
//   if (usuario === 'admin' && contraseña === '1234') {
//     const token = generarToken({ usuario });
//     res.json({ token });
//   } else {
//     res.status(401).json({ error: 'Credenciales inválidas' });
//   }
// };

// module.exports = { loginController };

const { loginService } = require('../services/auth.service');

const loginController = async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const token = await loginService(usuario, password);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = { loginController };
