// src/pages/Asignaturas.jsx
import { useEffect, useState } from "react";
import API from "../services/api";

export default function Asignaturas() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await API.get("/asignaturas");
    setAsignaturas(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const crear = async () => {
    if (!nombre.trim()) {
      alert("Nombre requerido");
      return;
    }

    try {
      setLoading(true);

      await API.post("/asignaturas", {
        nombre,
        color
      });

      setNombre("");
      load();
    } catch {
      alert("Error creando asignatura");
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar asignatura?")) return;

    try {
      await API.delete(`/asignaturas/${id}`);
      load();
    } catch (e) {
      alert(e.response?.data?.error || "Error eliminando");
    }
  };

  return (
    <div className="fade-up">
      <h2 className="mb-3">Asignaturas</h2>

      {/* FORM */}
      <div className="card p-3 mb-3 shadow-sm border-0">
        <h5>Nueva asignatura</h5>

        <div className="row g-2">
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <input
              type="color"
              className="form-control form-control-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <button
              className="btn btn-primary w-100"
              onClick={crear}
              disabled={loading}
            >
              Crear
            </button>
          </div>
        </div>
      </div>

      {/* LISTADO */}
      <div className="card p-3 shadow-sm border-0">
        <table className="table">
          <thead>
            <tr>
              <th>Asignatura</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {asignaturas.map((a) => (
              <tr key={a.id}>
                <td>
                  <span
                    style={{
                      background: a.color || "#ccc",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      color: "#fff"
                    }}
                  >
                    {a.nombre}
                  </span>
                </td>

                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => eliminar(a.id)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}