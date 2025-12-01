import { useEffect, useState } from "react";

function ListadoReportes() {
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    const fetchReportes = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/reporte/mis-reportes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setReportes(data);
    };
    fetchReportes();
  }, []);

  return (
    <div>
      <h2>Listado de Reportes</h2>
      <ul>
        {reportes.map(r => (
          <li key={r.id}>{r.marca} - {r.fecha}</li>
        ))}
      </ul>
    </div>
  );
}

export default ListadoReportes;
