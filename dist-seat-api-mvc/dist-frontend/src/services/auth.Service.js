// src/services/auth.Service.js

// src/services/auth.Service.js
import { fetchWithAuth } from "../utils/fetchWithAuth";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_URL = "http://localhost:3000/api/auth";

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Lanza el error que viene del backend si existe
      throw data;
    }

    return data;
  } catch (error) {
    throw error || { error: "Error desconocido" };
  }
};

export async function updateUser(id, data) {
  const res = await fetchWithAuth(`${BASE_URL}/api/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return await res.json();
}

export async function desactivarUsuario(id) {
  const res = await fetchWithAuth(`${BASE_URL}/api/usuarios/${id}/desactivar`, {
    method: "PATCH",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al desactivar usuario");
  }
  return await res.json();
}

export async function activarUsuario(id) {
  const res = await fetchWithAuth(`${BASE_URL}/api/usuarios/${id}/activar`, {
    method: "PATCH",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al activar usuario");
  }
  return await res.json();
}
