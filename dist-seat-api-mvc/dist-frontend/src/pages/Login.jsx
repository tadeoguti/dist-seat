import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/toast/ToastProvider";
import { Link } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogin = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          showToast({
            type: "error",
            message: "Tu cuenta está inactiva. Contacta al administrador.",
          });
        } else {
          // Mostrar mensaje de error del backend si existe
          const msg = data?.error || "Login fallido";
          showToast({ type: "error", message: msg });
        }
        return;
      }

      if (data.token && data.usuario) {
        const usuario = {
          id: data.usuario.id,
          nombre: data.usuario.name,
          email: data.usuario.mail,
          roleId: data.usuario.roleId,
          token: data.token,
        };

        localStorage.setItem("usuario", JSON.stringify(usuario));

        showToast({ type: "success", message: "Login exitoso ✅" });
        navigate("/generar-reporte");
      } else {
        showToast({ type: "error", message: "Login fallido" });
      }
    } catch (error) {
      showToast({
        type: "error",
        message: "Error de conexión con el servidor",
      });
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Ingresar</button>

      {/* 
      <p style={{ marginTop: "1rem" }}> 
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link> 
      </p> 
      */}
    </div>
  );
}

export default Login;
