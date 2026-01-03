import { useState, useEffect } from "react";
import { useToast } from "../components/toast/ToastProvider.jsx";
import Select from "react-select";
import { fetchWithAuth } from "../utils/fetchWithAuth.js";

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

function GenerarReporte() {
  const [marca, setMarca] = useState("");
  const [marcas, setMarcas] = useState([]);
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [distribuidoras, setDistribuidoras] = useState([]);
  const [loadingDistribuidoras, setLoadingDistribuidoras] = useState(false);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loadingReporte, setLoadingReporte] = useState(false); // 👈 nuevo estado
  const { showToast } = useToast();

  // Cargar marcas dinámicamente
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

  // Buscar distribuidoras
  const buscarDistribuidoras = async () => {
    if (!marca || !marca.trim()) {
      showToast({
        type: "warning",
        message: "Debes seleccionar una marca antes de buscar distribuidoras",
      });
      return;
    }

    setLoadingDistribuidoras(true);
    fetchWithAuth(`${BASE_URL}/api/distribuidoras?marca=${encodeURIComponent(marca)}`)
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

  // Generar reporte
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

    setLoadingReporte(true);
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/reporte`, {
        method: "POST",
        body: JSON.stringify({ marca, distribuidoras: seleccionadas }),
      });

      if (!res) return;
      if (!res.ok) throw new Error("Error al generar reporte");

      const data = await res.json();

      showToast({
        type: "success",
        message: "Reporte generado correctamente ✅",
      });

      if (data?.reporte?.archivoUrl) {
        window.open(data.reporte.archivoUrl, "_blank"); // 👈 simplificado
      }
    } catch (err) {
      showToast({ type: "error", message: err.message });
    } finally {
      setLoadingReporte(false);
    }
  };

  const distribuidorasFiltradas = distribuidoras.filter((d) =>
    d.nameDist.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <h2>Generar Reporte</h2>

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
          onClick={() => setSeleccionadas(distribuidoras.map((d) => d.idDist))}
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
              key={d.idDist}
              style={{ display: "block", marginBottom: "5px" }}
            >
              <input
                type="checkbox"
                value={d.idDist}
                checked={seleccionadas.includes(d.idDist)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSeleccionadas([...seleccionadas, d.idDist]);
                  } else {
                    setSeleccionadas(
                      seleccionadas.filter((id) => id !== d.idDist)
                    );
                  }
                }}
              />
              {` ${d.idDist} - ${d.nameDist} (${d.urlDist})`}
            </label>
          ))
        )}
      </div>

      <button onClick={generarReporte} disabled={loadingReporte}>
        {loadingReporte ? "Generando..." : "Generar Reporte"}
      </button>
    </div>
  );
}

export default GenerarReporte;
