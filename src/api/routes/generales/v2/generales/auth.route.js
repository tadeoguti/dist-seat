require('dotenv').config();
const express = require('express');
const router = express.Router();
const authController = require('../../../../controllers/generales/auth.controller');

// Ruta de registro
router.post('/register', authController.registerUser);

// Ruta de registro apikey
//router.post('/registerApikey', authController.registerApiKey);

// Ruta de login
//router.post('/login', authController.login)

// Ruta de login ApiKey
//router.post('/loginApiKey', authController.loginApiKey);

// Ruta de login
//router.post('/refreshToken', authController.refreshAccessToken);

module.exports = router;
