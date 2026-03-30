// src/pages/Usuarios.jsx
import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import RegisterForm from "../components/RegisterForm";
import { desactivarUsuario, activarUsuario } from "../services/auth.Service";
import { useToast } from "../components/toast/ToastProvider";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [error, setError] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const cargarUsuarios = async () => {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/Usuarios`);
      if (!res || !res.ok) throw new Error("Error al obtener usuarios");
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((u) =>
    `${u.username} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const handleEditar = (usuario) => {
    //alert(`Editar usuario: ${usuario.username}`);
    setUsuarioEditar(usuario);
    // Aquí luego puedes abrir un modal o formulario con los datos
  };

  const handleToggleActivo = async (usuario) => {
    const accion = usuario.activo ? "desactivar" : "activar";
    const confirmar = window.confirm(
      `¿Estás seguro de desactivar a ${usuario.username}?`,
    );
    if (!confirmar) return;

    try {
      if (usuario.activo) {
        await desactivarUsuario(usuario.id);
        //alert("✅ Usuario desactivado correctamente");
        showToast({
          type: "success",
          message: `Usuario ${usuario.username} desactivado`,
        });
      } else {
        await activarUsuario(usuario.id);
        //alert("✅ Usuario activado correctamente");
        showToast({
          type: "success",
          message: `Usuario ${usuario.username} activado`,
        });
      }
      cargarUsuarios();
    } catch (error) {
      //alert(`❌ Error al ${accion} usuario: ` + error.message);
      showToast({
        type: "error",
        message: `Error al ${accion} usuario: ${error.message}`,
      });
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Gestión de Usuarios</h1>
      <button onClick={() => navigate("/auditoria")}>
        Ver Auditoría de Usuarios
      </button>

      {/* Formulario de registro */}
      <RegisterForm
        onSuccess={() => {
          cargarUsuarios();
          setUsuarioEditar(null);
        }}
        usuarioEditar={usuarioEditar}
      />

      {/* Buscador */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: "0.5rem", width: "100%", maxWidth: "400px" }}
        />
      </div>

      {/* Tabla de usuarios */}
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <table border="1" cellPadding="8" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role_id === 1 ? "Admin" : "Usuario"}</td>
                <td>{u.activo ? "Sí" : "No"}</td>
                <td>
                  <button onClick={() => handleEditar(u)}>Editar</button>
                  <button onClick={() => handleToggleActivo(u)}>
                    {u.activo ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
