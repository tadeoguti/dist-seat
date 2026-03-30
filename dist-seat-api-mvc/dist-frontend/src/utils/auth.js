// src/utils/auth.js
export function getUsuario() {
    const stored = localStorage.getItem("usuario");
    return stored ? JSON.parse(stored) : null;
}

export function getToken() {
    return getUsuario()?.token || null;
}
