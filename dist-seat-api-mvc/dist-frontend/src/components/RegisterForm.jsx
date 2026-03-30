// src/components/RegisterForm.jsx
import React, { useState, useEffect } from "react";
import { registerUser, updateUser } from "../services/auth.Service";
import { useToast } from "../components/toast/ToastProvider.jsx";

const RegisterForm = ({ onSuccess, usuarioEditar }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    roleId: 2,
  });

  const [message, setMessage] = useState(null);
  const { showToast } = useToast();

  // Si recibimos un usuario para editar, llenamos el formulario
  useEffect(() => {
    if (usuarioEditar) {
      setForm({
        username: usuarioEditar.username,
        email: usuarioEditar.email,
        password: "",
        roleId: usuarioEditar.role_id,
      });
    }
  }, [usuarioEditar]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.password || form.password.trim().length < 8) {
      showToast({
        type: "error",
        message: "La contraseña debe tener al menos 8 caracteres",
      });
      return;
    }

    try {
      if (usuarioEditar) {
        await updateUser(usuarioEditar.id, form);
        setMessage("✅ Usuario actualizado correctamente");
      } else {
        const result = await registerUser(form);
        setMessage(`✅ ${result.message} (ID: ${result.userId})`);
      }

      setForm({ username: "", email: "", password: "", roleId: 2 });
      if (onSuccess) onSuccess();
    } catch (err) {
      setMessage(`❌ ${err.error || "Error al procesar el formulario"}`);
    }
  };

  return (
    <div>
      <h2>{usuarioEditar ? "Editar Usuario" : "Registro de Usuario"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Nombre Usuario"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder={usuarioEditar ? "Nueva contraseña" : "Contraseña"}
          value={form.password}
          onChange={handleChange}
          required={!usuarioEditar}
        />
        <select name="roleId" onChange={handleChange} value={form.roleId}>
          <option value="">Selecciona un rol</option>
          <option value={1}>Admin</option>
          <option value={2}>Usuario</option>
        </select>
        <button type="submit">
          {usuarioEditar ? "Guardar cambios" : "Registrar"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RegisterForm;
