const bcrypt = require('bcrypt');
const  userRepository  = require('../repository/user.repository');
const {generarToken} = require('../helpers/auth.helpers');
const { loginService } = require('../services/auth.service');

//registro 

async function register(req,res) {
  try {
    const { username, email, password, roleId } = req.body;

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Guardar en DB
    const userId = await userRepository.createUser(username, email, passwordHash, roleId);

    res.status(201).json({ message: 'Usuario creado', userId });
    
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario', details: error.message });
  }
  
}

//Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userRepository.findUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Comparar contraseña
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Generar JWT usando tu middleware
    const token = generarToken({ id: user.id, email: user.email, roleId: user.role_id });

    res.json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión', details: error.message });
  }
};

module.exports = { register, login };
