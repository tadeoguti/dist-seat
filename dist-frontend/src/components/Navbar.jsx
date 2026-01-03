import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/toast/ToastProvider.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { showToast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("token");
    showToast({ type: "info", message: "Sesión cerrada correctamente 👋" });
    navigate("/"); // redirige al login
  };

  return (
    <nav style={{ padding: "1rem", background: "#f4f4f4" }}>
      <ul style={{ display: "flex", gap: "1rem", listStyle: "none" }}>
        <li>
          <Link to="/generar-reporte">Generar Reporte</Link>
        </li>
        <li>
          <Link to="/mis-reportes">Mis Reportes</Link>
        </li>
        <li>
          {token ? (
            <button onClick={handleLogout}>Cerrar sesión</button>
          ) : (
            <Link to="/">Login</Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
