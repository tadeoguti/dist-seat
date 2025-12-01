import { useState } from "react";

const marcas = ["Seat", "Toyota", "Nissan"]; // hardcodeado por ahora

function GenerarReporte() {
  const [marca, setMarca] = useState("");
  const [distribuidoras, setDistribuidoras] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);

  const buscarDistribuidoras = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:3000/api/distribuidoras?marca=${marca}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    setDistribuidoras(data);
  };

  const generarReporte = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/api/reporte", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ marca, distribuidoras: seleccionadas }),
    });
    const data = await res.json();
    alert("Reporte generado: " + JSON.stringify(data));
  };

  return (
    <div>
      <h2>Generar Reporte</h2>
      <select value={marca} onChange={(e) => setMarca(e.target.value)}>
        <option value="">Selecciona una marca</option>
        {marcas.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <button onClick={buscarDistribuidoras}>Buscar</button>

      <select
        multiple
        value={seleccionadas}
        onChange={(e) =>
          setSeleccionadas([...e.target.selectedOptions].map((o) => o.value))
        }
      >
        {distribuidoras.map((d) => (
          <option key={d.idDist} value={d.idDist}>
            {d.idDist} - {d.nameDist} ({d.urlDist})
          </option>
        ))}
      </select>

      <button onClick={generarReporte}>Generar Reporte</button>
    </div>
  );
}

export default GenerarReporte;
