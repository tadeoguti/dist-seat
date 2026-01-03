// src/utils/apiFetch.js
export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
        // devolvemos null en 401/403
        if (res.status === 401 || res.status === 403) {
            return null;
        }
        throw new Error(res.statusText);
    }

    return await res.json();
}
