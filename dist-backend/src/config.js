// src/config.js
const path = require("path");

const STORAGE_PATH = path.resolve(__dirname, "../storage");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

module.exports = { STORAGE_PATH , BASE_URL };

