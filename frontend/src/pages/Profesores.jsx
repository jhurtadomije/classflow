// src/pages/Profesores.jsx
import React from "react";
import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import ProfesorAsignaturas from "../components/ProfesorAsignaturas";

export default function Profesores() {
  const navigate = useNavigate();
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profesorActivo, setProfesorActivo] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    crear_usuario: false,
    password: "",
    rol: "profesor",
  });

  const load = async () => {
    const res = await API.get("/profesores");
    setProfesores(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const crear = async () => {
    if (!form.nombre) {
      alert("El nombre es obligatorio");
      return;
    }

    if (form.crear_usuario && (!form.email || !form.password)) {
      alert("Email y contraseña requeridos");
      return;
    }

    try {
      setLoading(true);

      await API.post("/profesores", form);

      setForm({
        nombre: "",
        apellidos: "",
        email: "",
        crear_usuario: false,
        password: "",
        rol: "profesor",
      });

      load();
    } catch (error) {
      alert("Error creando profesor");
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar profesor?")) return;

    try {
      await API.delete(`/profesores/${id}`);
      load();
    } catch {
      alert("Error eliminando");
    }
  };

  return (
    <div className="fade-up">
      <h2 className="mb-3">Profesores</h2>

      {/* FORM */}
      <div className="card p-3 mb-3 shadow-sm border-0">
        <h5>Nuevo profesor</h5>

        <div className="row g-2">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Apellidos"
              value={form.apellidos}
              onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
            />
          </div>

          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        {/* USER */}
        <div className="form-check mt-3">
          <input
            type="checkbox"
            className="form-check-input"
            checked={form.crear_usuario}
            onChange={(e) =>
              setForm({ ...form, crear_usuario: e.target.checked })
            }
          />
          <label className="form-check-label">Crear acceso al sistema</label>
        </div>

        {form.crear_usuario && (
          <div className="row g-2 mt-2">
            <div className="col-md-4">
              <input
                type="password"
                className="form-control"
                placeholder="Contraseña"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
              >
                <option value="profesor">Profesor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
        )}

        <button
          className="btn btn-primary mt-3"
          onClick={crear}
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear profesor"}
        </button>
      </div>

      {/* LISTADO */}
      <div className="card p-3 shadow-sm border-0">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Profesor</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {profesores.map((p) => (
              <React.Fragment key={p.id}>
                <tr>
                  <td>
                    <strong>{p.nombre}</strong>
                    <div className="small text-muted">{p.apellidos || ""}</div>
                  </td>

                  <td>{p.usuario_email || "—"}</td>

                  <td>
                    {p.rol ? (
                      <span
                        className={`badge ${
                          p.rol === "admin" ? "bg-danger" : "bg-primary"
                        }`}
                      >
                        {p.rol}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>
                    <button
                      className="btn btn-sm btn-secondary me-2"
                      onClick={() =>
                        setProfesorActivo(profesorActivo === p.id ? null : p.id)
                      }
                    >
                      Asignaturas
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => eliminar(p.id)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>

                {profesorActivo === p.id && (
                  <tr>
                    <td colSpan="4">
                      <ProfesorAsignaturas profesorId={p.id} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
