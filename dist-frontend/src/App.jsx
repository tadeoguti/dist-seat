import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import GenerarReporte from "./pages/GenerarReporte";
import ListadoReportes from "./pages/ListadoReportes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/generar-reporte" element={<GenerarReporte />} />
        <Route path="/listado-reportes" element={<ListadoReportes />} />
      </Routes>
    </Router>
  );
}

export default App;
