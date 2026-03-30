// src/routes/RutaPrivadaAdmin.jsx
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function RutaPrivadaAdmin({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = usuario?.token;

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.roleId === 1) {
      return children; // Es admin, puede ver la ruta
    } else {
      return <Navigate to="/no-autorizado" replace />;
    }
  } catch (error) {
    console.error("Token inválido:", error);
    return <Navigate to="/" replace />;
  }
}
