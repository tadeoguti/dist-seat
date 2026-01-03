// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useToast } from "../components/toast/ToastProvider.jsx";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const { showToast } = useToast();

  if (!token) {
    showToast({ type: "error", message: "Debes iniciar sesión para acceder 🚫" });
    return <Navigate to="/" replace />;
  }

  return children;
}
