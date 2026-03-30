// src/utils/processManager.js

const procesosActivos = new Map();

function registrarProceso(sessionId, controller) {
    procesosActivos.set(sessionId, controller);
}

function cancelarProceso(sessionId) {
    const controller = procesosActivos.get(sessionId);
    if (controller) {
        controller.abort?.(); // si es AbortController
        controller.kill?.();  // si es child_process
        controller.close?.(); // si es puppeteer browser
        procesosActivos.delete(sessionId);
        return true;
    }
    return false;
}

function eliminarProceso(sessionId) {
    procesosActivos.delete(sessionId);
}

function obtenerProceso(sessionId) {
    return procesosActivos.get(sessionId);
}

module.exports = {
    registrarProceso,
    cancelarProceso,
    eliminarProceso,
    obtenerProceso,
};
