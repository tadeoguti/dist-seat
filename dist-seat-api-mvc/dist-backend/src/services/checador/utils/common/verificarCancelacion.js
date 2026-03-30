// src/services/checador/utils/common/verificarCancelacion.js
const sseBus = require("../../../../utils/sseBus");

function verificarCancelacion(signal, sessionId) {
    if (signal?.aborted) {
        sseBus.emit(sessionId, {
            type: "cancel",
            step: "cancelado",
            message: "Proceso cancelado por el usuario.",
        });
        throw new Error("Proceso cancelado por el usuario");
    }
}
module.exports = verificarCancelacion;