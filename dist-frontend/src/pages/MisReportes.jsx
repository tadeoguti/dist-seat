import { useEffect, useState } from "react";
import { useToast } from "../components/toast/ToastProvider.jsx";
import { fetchWithAuth } from "../utils/fetchWithAuth.js";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function MisReportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const loadReportes = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${BASE_URL}/api/reporte/mis-reportes`);

        if (!res) return; // token expirado → ya redirigió
        if (!res.ok) throw new Error("Error al cargar reportes");

        const data = await res.json();
        setReportes(data);

        showToast({
          type: "success",
          message: "Reportes cargados correctamente ✅",
        });
      } catch (err) {
        showToast({
          type: "error",
          message: "Error al cargar reportes: " + err.message,
        });
      } finally {
        setLoading(false);
      }
    };

    loadReportes();
  }, []);

  if (loading) return <p style={{ color: "yellow" }}>Cargando reportes...</p>;

  return (
    <div>
      <h2>Mis Reportes</h2>
      {reportes.length === 0 ? (
        <p>No tienes reportes generados.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Marca</th>
              <th>Distribuidoras</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((r) => (
              <tr key={r.id}>
                <td>{r.marca}</td>
                <td>
                  {Array.isArray(r.distribuidoras) && r.distribuidoras.length > 0
                    ? r.distribuidoras.map((d) => (
                        <div key={d.id}>
                          <a
                            href={d.url?.startsWith("http") ? d.url : `http://${d.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {d.name}
                          </a>
                        </div>
                      ))
                    : "Sin distribuidoras"}
                </td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
                <td>
                  {r.fileUrl ? (
                    <a href={r.fileUrl} target="_blank" rel="noreferrer">
                      Descargar
                    </a>
                  ) : (
                    "No disponible"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
