// src/pages/AuditoriaUsuarios.jsx
import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { useToast } from "../components/toast/ToastProvider";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AuditoriaUsuarios() {
  const [registros, setRegistros] = useState([]);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const cargarAuditoria = async () => {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/auditoria`);
      if (!res.ok) throw new Error("Error al obtener auditoría");
      const data = await res.json();
      setRegistros(data);
    } catch (err) {
      setError(err.message);
      showToast({ type: "error", message: err.message });
    }
  };

  useEffect(() => {
    cargarAuditoria();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Auditoría de Usuarios</h1>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <table border="1" cellPadding="8" width="100%">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Acción</th>
              <th>Usuario Afectado</th>
              <th>Realizado por</th>
              <th>Antes</th>
              <th>Después</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.fecha).toLocaleString()}</td>
                <td>{r.accion}</td>
                <td>{r.usuario_afectado}</td>
                <td>{r.realizado_por || "Sistema"}</td>
                <td>
                  <pre>{JSON.stringify(r.payload_anterior, null, 2)}</pre>
                </td>
                <td>
                  <pre>{JSON.stringify(r.payload_nuevo, null, 2)}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
