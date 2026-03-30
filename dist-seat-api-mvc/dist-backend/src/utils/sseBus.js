// src/utils/sseBus.js
const { EventEmitter } = require("events");
const sseBus = new EventEmitter();
sseBus.setMaxListeners(1000); // evita advertencias si hay muchas sesiones

module.exports = sseBus;
