// src/controllers/user.controller.js
const reporteService = require("../services/reporte.service");

async function createReporte(req, res) {
  try {
    const reporte = await reporteService.createReporte(req.body);
    res.status(201).json(reporte);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// async function getUsers(req, res) {
//   try {
//     const users = await userService.getUsers();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }

//module.exports = { createUser, getUsers };
module.exports =  { createReporte };
