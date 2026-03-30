import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../components/toast/ToastProvider.jsx";
import { getUsuario } from "../utils/auth";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(!!getUsuario()?.token);
  // 🔐 Determinar si el usuario es admin
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    // Se ejecuta cada vez que cambia la ruta
    setIsLoggedIn(!!getUsuario()?.token);

    const usuario = getUsuario();
    if (usuario?.token) {
      try {
        const decode = jwtDecode(usuario.token);
        setEsAdmin(decode.roleId === 1);
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        setEsAdmin(false);
      }
    } else {
      setEsAdmin(false);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    showToast({ type: "info", message: "Sesión cerrada correctamente 👋" });
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav style={{ padding: "1rem", background: "#f4f4f4" }}>
      <ul style={{ display: "flex", gap: "1rem", listStyle: "none" }}>
        {isLoggedIn && (
          <>
            <li>
              <Link to="/generar-reporte">Generar Reporte</Link>
            </li>
            <li>
              <Link to="/mis-reportes">Mis Reportes</Link>
            </li>
            {esAdmin && (
              <li>
                <Link to="/usuarios">Usuarios</Link>
              </li>
            )}
          </>
        )}
        <li>
          {isLoggedIn ? (
            <button onClick={handleLogout}>Cerrar sesión</button>
          ) : (
            <Link to="/">Login</Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
