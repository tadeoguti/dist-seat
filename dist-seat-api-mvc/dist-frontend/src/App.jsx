import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import GenerarReporte from "./pages/GenerarReporte";
import MisReportes from "./pages/MisReportes";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Register from "./pages/Register";
import RutaPrivadaAdmin from "./routes/RutaPrivadaAdmin";
import Usuarios from "./pages/Usuarios";
import NoAutorizado from "./pages/NoAutorizado";
import AuditoriaUsuarios from "./pages/AuditoriaUser";

function App() {
  return (
    <Router>
      <div>
        {/* Aquí se renderiza la barra de navegación en todas las vistas */}
        <Navbar />

        {/* Aquí se renderizan las rutas */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
          <Route
            path="/usuarios"
            element={
              <RutaPrivadaAdmin>
                <Usuarios />
              </RutaPrivadaAdmin>
            }
          />
          <Route
            path="/auditoria"
            element={
              <RutaPrivadaAdmin>
                {" "}
                <AuditoriaUsuarios />{" "}
              </RutaPrivadaAdmin>
            }
          />
          <Route path="/no-autorizado" element={<NoAutorizado />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
