// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useToast } from "../components/toast/ToastProvider.jsx";
import { getToken } from "../utils/auth";

export default function PrivateRoute({ children }) {
  const token = getToken();
  console.log(JSON.parse(localStorage.getItem(token)));
  const { showToast } = useToast();

  if (!token) {
    showToast({
      type: "error",
      message: "Debes iniciar sesión para acceder 🚫",
    });
    return <Navigate to="/" replace />;
  }

  return children;
}
