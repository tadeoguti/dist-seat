// src/utils/fetchWithAuth.js
import { getToken } from "../utils/auth";

export async function fetchWithAuth(url, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("usuario");
    window.location.href = "/";
    return;
  }

  return res;
}
