//auth.route.js
const express = require('express');
const { login, register } = require('../controllers/auth.controller');
const router = express.Router();

// ruta de registro 
router.post('/register', register)

//ruta de login 
router.post('/login', login);

module.exports = router;
