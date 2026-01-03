import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import GenerarReporte from "./pages/GenerarReporte";
import MisReportes from "./pages/MisReportes";
import PrivateRoute from "./components/PrivateRoute.jsx";

function App() {
  return (
    <Router>
      <div>
        {/* Aquí se renderiza la barra de navegación en todas las vistas */}
        <Navbar />

        {/* Aquí se renderizan las rutas */}
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Rutas privadas */}
          <Route
            path="/generar-reporte"
            element={
              <PrivateRoute>
                <GenerarReporte />
              </PrivateRoute>
            }
          />
          <Route
            path="/mis-reportes"
            element={
              <PrivateRoute>
                <MisReportes />
              </PrivateRoute>
            }
          />

          {/*<Route path="/generar-reporte" element={<GenerarReporte />} />
          <Route path="/listado-reportes" element={<ListadoReportes />} />
          <Route path="/mis-reportes" element={<MisReportes />} />*/}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
