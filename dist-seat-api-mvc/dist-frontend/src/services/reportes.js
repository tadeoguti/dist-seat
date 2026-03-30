// src/services/reportes.js
const BASE_URL = import.meta.env.VITE_BASE_URL;
import { fetchWithAuth } from "../utils/fetchWithAuth.js";


export const iniciarProceso = async ({ sessionId, marca, distribuidoras }) => {
    const res = await fetchWithAuth(`${BASE_URL}/api/reporte`, {
        method: 'POST',
        headers: {
            "x-session-id": sessionId,
        },
        body: JSON.stringify({ marca, distribuidoras }),
        //body: JSON.stringify({ marca, distribuidoras: seleccionadas }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al iniciar el proceso");
    }

    return res.json();
};

export const cancelarProceso = async (sessionId) => {
    const res = await fetchWithAuth(`${BASE_URL}/api/reporte/cancelar/${sessionId}`, {
        method: 'POST',
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al cancelar el proceso");
    }
};

export const escucharProgreso = (sessionId, onEvent, onError) => {
    console.log("🎧 Escuchando SSE en:", `${BASE_URL}/api/stream/sse/${sessionId}`);
    const source = new EventSource(`${BASE_URL}/api/stream/sse/${sessionId}`);

    const tipos = ["info", "phase", "detail", "warn", "error", "done", "end", "cancel"];

    source.onmessage = (e) => { console.log("📨 Evento sin tipo:", e.data); };

    tipos.forEach((tipo) => {
        source.addEventListener(tipo, (e) => {
            try {
                const data = JSON.parse(e.data);
                onEvent({ ...data, type: data.type || tipo });
            } catch (err) {
                console.error("Error al parsear evento SSE:", err);
            }
        });
    });
    source.onerror = (err) => {
        source.close(); onError(err);
    };
    return source;
};
