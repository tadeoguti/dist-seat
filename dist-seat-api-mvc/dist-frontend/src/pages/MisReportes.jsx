import { useEffect, useState } from "react";
import { useToast } from "../components/toast/ToastProvider.jsx";
import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import { usePaginacion } from "../hooks/usePaginacion";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function MisReportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [filtro, setFiltro] = useState("");
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const reportesFiltrados = reportes.filter((r) => {
    const marca = r.marca?.toLowerCase() || "";
    const usuario = r.usuario?.username?.toLowerCase() || "";
    const distribuidoras = Array.isArray(r.distribuidoras)
      ? r.distribuidoras.map((d) => d.name?.toLowerCase()).join(" ")
      : "";

    const texto = filtro.toLowerCase();

    const coincideTexto =
      marca.includes(texto) ||
      usuario.includes(texto) ||
      distribuidoras.includes(texto);
    const fechaReporte = new Date(r.created_at);
    const desde = fechaInicio ? new Date(fechaInicio) : null;
    const hasta = fechaFin ? new Date(fechaFin + "T23:59:59") : null;
    const dentroDeRango =
      (!desde || fechaReporte >= desde) && (!hasta || fechaReporte <= hasta);
    return coincideTexto && dentroDeRango;
  });

  const {
    paginaActual,
    totalPaginas,
    datosPaginados,
    irPaginaAnterior,
    irPaginaSiguiente,
    setPaginaActual,
  } = usePaginacion(reportesFiltrados, itemsPorPagina);

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const esAdmin = usuario?.roleId === 1;

  useEffect(() => {
    const loadReportes = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${BASE_URL}/api/reporte/mis-reportes`);

        if (!res) return; // token expirado → ya redirigió
        if (!res.ok) throw new Error("Error al cargar reportes");

        const data = await res.json();
        //setReportes(data);
        setReportes(data.reportes || []);
        console.log("Reportes recibidos:", data.reportes);

        if (data.reportes?.length) {
          showToast({
            type: "success",
            message: "Reportes cargados correctamente ✅",
          });
        }
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
      <input
        type="text"
        placeholder="Buscar por marca o usuario"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        style={{ marginBottom: "1rem", padding: "6px", width: "300px" }}
      />

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Desde:{" "}
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => {
              setFechaInicio(e.target.value);
              setPaginaActual(1);
            }}
          />
        </label>{" "}
        <label style={{ marginLeft: "1rem" }}>
          Hasta:{" "}
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => {
              setFechaFin(e.target.value);
              setPaginaActual(1);
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Mostrar{" "}
          <select
            value={itemsPorPagina}
            onChange={(e) => {
              setItemsPorPagina(Number(e.target.value));
              setPaginaActual(1); // Reinicia a la primera página
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>{" "}
          reportes por página
        </label>
      </div>

      {reportes.length === 0 ? (
        <p>No tienes reportes generados.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Marca</th>
              <th>Distribuidoras</th>
              <th>Fecha</th>
              {esAdmin && <th>Usuario</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPaginados.map((r) => (
              <tr key={r.id}>
                <td>{r.marca}</td>
                <td>
                  {Array.isArray(r.distribuidoras) &&
                  r.distribuidoras.length > 0
                    ? r.distribuidoras.map((d) => (
                        <div key={d.id}>
                          <a
                            href={
                              d.url?.startsWith("http")
                                ? d.url
                                : `http://${d.url}`
                            }
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
                {esAdmin && <td>{r.usuario?.username || "Desconocido"}</td>}
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
      <div style={{ marginTop: "1rem" }}>
        <button onClick={irPaginaAnterior} disabled={paginaActual === 1}>
          Anterior
        </button>
        <span style={{ margin: "0 1rem" }}>
          Página {paginaActual} de {totalPaginas}
        </span>
        <button
          onClick={irPaginaSiguiente}
          disabled={paginaActual >= totalPaginas}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
