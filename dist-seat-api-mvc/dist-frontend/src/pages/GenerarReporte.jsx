import { useState, useEffect, useRef } from "react";
import { useToast } from "../components/toast/ToastProvider.jsx";
import Select from "react-select";
import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import ProgresoReporte from "../components/ProgresoReporte";
import { generarSessionId } from "../utils/session";
import {
  iniciarProceso,
  cancelarProceso,
  escucharProgreso,
} from "../services/reportes";

// [CONSTANTES]
const BASE_URL = import.meta.env.VITE_BASE_URL;
const customStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#222",
    color: "#fff",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#444" : "#222",
    color: "#fff",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#222",
  }),
  input: (base) => ({
    ...base,
    color: "#fff",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#aaa",
  }),
};

// [COMPONENTE PRINCIPAL]
function GenerarReporte() {
  const [marca, setMarca] = useState("");
  const [marcas, setMarcas] = useState([]);
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [distribuidoras, setDistribuidoras] = useState([]);
  const [loadingDistribuidoras, setLoadingDistribuidoras] = useState(false);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [mostrarProgreso, setMostrarProgreso] = useState(false);
  const [procesoEnCurso, setProcesoEnCurso] = useState(false);
  const [logs, setLogs] = useState([]);
  const [estado, setEstado] = useState("Procesando...");
  const [excelUrl, setExcelUrl] = useState(null);
  const sseStarted = useRef(false);
  const [sessionId, setSessionId] = useState(null);
  const [eventSource, setEventSource] = useState(null);
  const { showToast } = useToast();

  const storedUser = localStorage.getItem("usuario");
  const user = storedUser ? JSON.parse(storedUser) : null;
  //const sessionId = user?.id;
  //const sessionId = uuidv4();
  console.log("🧪 Usuario cargado:", user);
  console.log("🧪 sessionId:", sessionId);

  // Cargar marcas dinámicamente
  // [CARGAR MARCAS]
  useEffect(() => {
    setLoadingMarcas(true);

    fetchWithAuth(`${BASE_URL}/api/marcas`)
      .then((res) => {
        if (!res) return; // token expirado → ya redirigió
        if (!res.ok) throw new Error("Error al cargar marcas");
        return res.json();
      })
      .then((data) => setMarcas(data))
      .catch((err) => showToast({ type: "error", message: err.message }))
      .finally(() => setLoadingMarcas(false));
  }, []);

  const opcionesMarcas = marcas.map((m) => ({
    value: m.nombre,
    label: m.nombre,
  }));

  // [BUSCAR DISTRIBUIDORAS]
  const buscarDistribuidoras = async () => {
    if (!marca || !marca.trim()) {
      showToast({
        type: "warning",
        message: "Debes seleccionar una marca antes de buscar distribuidoras",
      });
      return;
    }

    setLoadingDistribuidoras(true);
    fetchWithAuth(
      `${BASE_URL}/api/distribuidoras?marca=${encodeURIComponent(marca)}`,
    )
      .then((res) => {
        if (!res) return;
        if (!res.ok) throw new Error("Error al cargar distribuidoras");
        return res.json();
      })
      .then((data) => {
        setDistribuidoras(data);
        showToast({
          type: "success",
          message: "Distribuidoras cargadas correctamente ✅",
        });
      })
      .catch((err) => showToast({ type: "error", message: err.message }))
      .finally(() => setLoadingDistribuidoras(false));
  };

  // [GENERAR REPORTE]
  const generarReporte = async () => {
    if (!marca || !marca.trim()) {
      showToast({
        type: "warning",
        message: "Debes seleccionar una marca antes de generar el reporte",
      });
      return;
    }

    if (seleccionadas.length === 0) {
      showToast({
        type: "warning",
        message: "Debes seleccionar al menos una distribuidora",
      });
      return;
    }
    const nuevaSesion = generarSessionId();
    setSessionId(nuevaSesion);
    setMostrarProgreso(true);
    setProcesoEnCurso(true);
    setLoadingReporte(true);
    console.log("🚀 Ejecutando generarReporte con sessionId:", sessionId);

    console.log("🧪 sessionId que se enviará al SSE:", sessionId);

    //Flujo nuevo
    const source = escucharProgreso(
      nuevaSesion,
      (evento) => {
        //console.log("📡 Evento recibido:", evento);
        setLogs((prev) => [...prev, evento]);

        if (evento.type === "done" || evento.type === "end") {
          setEstado("Finalizado");
          setProcesoEnCurso(false);
          if (evento.payload?.excelPath) {
            setExcelUrl(`${BASE_URL}${evento.payload.excelPath}`);
          }
          source.close();
        }

        if (evento.type === "cancel") {
          setEstado("Cancelado");
          setProcesoEnCurso(false);
          source.close();
        }

        if (evento.type === "error") {
          setEstado("error");
        }
      },
      (err) => {
        setLogs((prev) => [...prev, { type: "error", message: err.message }]);
        setEstado("error");
        setProcesoEnCurso(false);
      },
    );

    setEventSource(source);
    try {
      const data = await iniciarProceso({
        sessionId: nuevaSesion,
        marca,
        distribuidoras: seleccionadas,
      });
      if (data?.reporte?.archivoUrl) {
        setExcelUrl(data.reporte.archivoUrl);
      }

      showToast({
        type: "success",
        message: "Reporte generado correctamente ✅",
      });
    } catch (err) {
      if (err.message === "Proceso cancelado por el usuario") {
        setEstado("Cancelado");
        showToast({
          type: "info",
          message: "Proceso cancelado por el usuario",
        });
      } else {
        setEstado("error");
        showToast({
          type: "error",
          message: err.message,
        });
      }
      setProcesoEnCurso(false);
      source.close();
    } finally {
      setLoadingReporte(false);
    }
    /* Proceso Anterior 
    iniciarSSE();
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/reporte`, {
        method: "POST",
        body: JSON.stringify({ marca, distribuidoras: seleccionadas }),
      });

      if (!res) return;
      if (!res.ok) throw new Error("Error al generar reporte");

      const data = await res.json();
      if (data?.reporte?.archivoUrl) {
        setExcelUrl(data.reporte.archivoUrl);
        //window.open(data.reporte.archivoUrl, "_blank");
      }

      showToast({
        type: "success",
        message: "Reporte generado correctamente ✅",
      });
    } catch (err) {
      showToast({ type: "error", message: err.message });
    } finally {
      setLoadingReporte(false);
    }
    */
  };
  // [CANCELAR PROCESO]
  const handleCancelar = async () => {
    if (!sessionId) return;
    await cancelarProceso(sessionId);
    if (eventSource) eventSource.close();
    setProcesoEnCurso(false);
    setEstado("Cancelado");
    showToast({ type: "info", message: "Proceso cancelado por el usuario" });
  };
  /*
  const iniciarSSE = () => {
    if (sseStarted.current) {
      console.warn("⛔ SSE ya iniciada, ignorando llamada duplicada");
      return;
    }
    sseStarted.current = true;
    console.log("📡 SSE iniciado con sessionId:", sessionId);

    // const params = new URLSearchParams();
    // params.set("marca", marca);
    // params.set("distIds", seleccionadas.join(","));
    // params.set("sessionId", sessionId);

    // const es = new EventSource(
    //   //`${BASE_URL}/api/reporte/progreso-reporte?${params.toString()}`,
    //   `${BASE_URL}/api/stream/sse/?${params.toString()}`,
    // );
    const es = new EventSource(`${BASE_URL}/api/stream/sse/${sessionId}`);

    es.addEventListener("info", (e) =>
      setLogs((prev) => [...prev, JSON.parse(e.data)]),
    );
    es.addEventListener("phase", (e) =>
      setLogs((prev) => [...prev, JSON.parse(e.data)]),
    );
    es.addEventListener("detail", (e) =>
      setLogs((prev) => [...prev, JSON.parse(e.data)]),
    );
    es.addEventListener("warn", (e) =>
      setLogs((prev) => [...prev, JSON.parse(e.data)]),
    );
    es.addEventListener("error", (e) => {
      setLogs((prev) => [...prev, JSON.parse(e.data)]);
      setEstado("error");
    });
    es.addEventListener("done", (e) => {
      const data = JSON.parse(e.data);
      setLogs((prev) => [...prev, data]);
      setEstado("Finalizado");
      if (data.payload?.excelPath) {
        setExcelUrl(`${BASE_URL}${data.payload.excelPath}`);
      }
      setProcesoEnCurso(false);
    });
    es.addEventListener("end", (e) => {
      const data = JSON.parse(e.data);
      setLogs((prev) => [...prev, data]);
      setEstado("Finalizado");
      if (data.payload?.excelPath) {
        setExcelUrl(`${BASE_URL}${data.payload.excelPath}`);
      }
      setProcesoEnCurso(false);
      es.close();
    });

    es.onerror = () => {
      setLogs((prev) => [
        ...prev,
        { type: "error", message: "Conexión cerrada o error de red." },
      ]);
      setEstado("error");
      es.close();
    };
  };
  */
  const distribuidorasFiltradas = distribuidoras.filter((d) =>
    d.nombre.toLowerCase().includes(filtro.toLowerCase() || ""),
  );
  console.log("📎 excelUrl generado:", excelUrl);

  return (
    <div>
      <h2>Generar Reporte</h2>
      <p style={{ fontSize: "0.8rem", color: "#888" }}>
        Session ID: {sessionId} {/* 🐞 Visualización para depuración */}
      </p>

      <label htmlFor="marca">Marca:</label>
      <Select
        id="marca"
        options={opcionesMarcas}
        value={opcionesMarcas.find((o) => o.value === marca) || null}
        onChange={(opcion) => setMarca(opcion.value)}
        isSearchable={true}
        isLoading={loadingMarcas}
        styles={customStyles}
        placeholder="Selecciona o busca una marca..."
      />

      {loadingMarcas && (
        <p style={{ color: "yellow" }}>Cargando marcas, por favor espera...</p>
      )}

      <button onClick={buscarDistribuidoras} disabled={loadingMarcas}>
        {loadingDistribuidoras ? "Buscando..." : "Buscar"}
      </button>

      {loadingDistribuidoras && (
        <p style={{ color: "yellow" }}>
          Buscando distribuidoras, por favor espera...
        </p>
      )}

      <input
        type="text"
        placeholder="Buscar distribuidora..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        style={{
          marginTop: "10px",
          marginBottom: "10px",
          padding: "5px",
          width: "100%",
          backgroundColor: "#333",
          color: "#fff",
          border: "1px solid #444",
        }}
      />

      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={() => setSeleccionadas(distribuidoras.map((d) => d.id_dist))}
          style={{ marginRight: "10px" }}
        >
          Seleccionar todas
        </button>
        <button onClick={() => setSeleccionadas([])}>Limpiar selección</button>
      </div>

      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #444",
          padding: "10px",
          backgroundColor: "#222",
          color: "#fff",
        }}
      >
        {distribuidorasFiltradas.length === 0 ? (
          <p style={{ color: "#aaa" }}>No hay distribuidoras cargadas aún</p>
        ) : (
          distribuidorasFiltradas.map((d) => (
            <label
              key={d.id_dist}
              style={{ display: "block", marginBottom: "5px" }}
            >
              <input
                type="checkbox"
                value={d.id_dist}
                checked={seleccionadas.includes(d.id_dist)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSeleccionadas([...seleccionadas, d.id_dist]);
                  } else {
                    setSeleccionadas(
                      seleccionadas.filter((id) => id !== d.id_dist),
                    );
                  }
                }}
              />
              {` ${d.id} - ${d.nombre} (${d.url})`}
            </label>
          ))
        )}
      </div>

      <button
        onClick={() => {
          if (!procesoEnCurso && !loadingReporte) {
            generarReporte();
          }
        }}
        disabled={loadingReporte || procesoEnCurso}
      >
        {loadingReporte || procesoEnCurso ? "Generando..." : "Generar Reporte"}
      </button>
      <button
        onClick={handleCancelar}
        disabled={!procesoEnCurso}
        style={{ marginLeft: "10px" }}
      >
        Cancelar
      </button>
      {mostrarProgreso && (
        <ProgresoReporte
          logs={logs}
          estado={estado}
          excelUrl={excelUrl}
          onCerrar={() => {
            setMostrarProgreso(false); // Oculta el componente visual
            setLogs([]); // Limpia los logs del proceso
            setEstado("esperando"); // Reinicia el estado visual
            setExcelUrl(null); // Elimina el enlace al Excel generado
            sseStarted.current = false;
          }}
        />
      )}
    </div>
  );
}

export default GenerarReporte;
