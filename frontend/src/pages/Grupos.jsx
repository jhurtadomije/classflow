import { useEffect, useState } from "react";
import API from "../services/api";

export default function Grupos() {
  const [grupos, setGrupos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [profesores, setProfesores] = useState([]);

  const [nombre, setNombre] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [tutorId, setTutorId] = useState("");

  // 🔥 EDICIÓN
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editCursoId, setEditCursoId] = useState("");
  const [editTutorId, setEditTutorId] = useState("");

  const load = async () => {
    const [g, c, p] = await Promise.all([
      API.get("/grupos"),
      API.get("/cursos"),
      API.get("/profesores"),
    ]);

    setGrupos(g.data);
    setCursos(c.data);
    setProfesores(p.data);
  };

  useEffect(() => {
  const init = async () => {
    await load();
  };
  init();
}, []);
  // ➕ CREAR
  const crear = async () => {
    if (!nombre || !cursoId) {
      return alert("Completa nombre y curso");
    }

    await API.post("/grupos", {
      nombre,
      curso_id: Number(cursoId),
      tutor_id: tutorId ? Number(tutorId) : null,
    });

    setNombre("");
    setCursoId("");
    setTutorId("");

    load();
  };

  // ✏️ INICIAR EDICIÓN
  const editar = (g) => {
    setEditId(g.id);
    setEditNombre(g.nombre);
    setEditCursoId(g.curso_id);
    setEditTutorId(g.tutor_id || "");
  };

  // 💾 GUARDAR
  const guardar = async () => {
    if (!editNombre || !editCursoId) {
      return alert("Datos incompletos");
    }

    try {
      await API.put(`/grupos/${editId}`, {
        nombre: editNombre,
        curso_id: Number(editCursoId),
        tutor_id: editTutorId ? Number(editTutorId) : null,
      });

      cancelar();
      load();
    } catch (err) {
      console.log("ERROR COMPLETO:", err);
      console.log("RESPUESTA:", err.response);

      alert(err.response?.data?.error || "Error al guardar");
    }
  };

  const cancelar = () => {
    setEditId(null);
  };

  // ❌ ELIMINAR
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar grupo?")) return;

    await API.delete(`/grupos/${id}`);
    load();
  };

  return (
    <div className="fade-up">
      <h2>Grupos</h2>

      {/* FORM CREAR */}
      <div className="card p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Nombre (1ºA)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
            >
              <option value="">Curso</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={tutorId}
              onChange={(e) => setTutorId(e.target.value)}
            >
              <option value="">Tutor</option>
              {profesores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <button className="btn btn-primary w-100" onClick={crear}>
              Crear
            </button>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <table className="table">
        <thead>
          <tr>
            <th>Grupo</th>
            <th>Curso</th>
            <th>Tutor</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {grupos.map((g) => (
            <tr key={g.id}>
              {editId === g.id ? (
                <>
                  <td>
                    <input
                      className="form-control"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                    />
                  </td>

                  <td>
                    <select
                      className="form-select"
                      value={editCursoId}
                      onChange={(e) => setEditCursoId(e.target.value)}
                    >
                      {cursos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <select
                      className="form-select"
                      value={editTutorId}
                      onChange={(e) => setEditTutorId(e.target.value)}
                    >
                      <option value="">Sin tutor</option>
                      {profesores.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={guardar}
                    >
                      ✔
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={cancelar}
                    >
                      ✕
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{g.nombre}</td>
                  <td>{g.curso || g.curso_id}</td>
                  <td>{g.tutor || "—"}</td>

                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => editar(g)}
                    >
                      ✏️
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => eliminar(g.id)}
                    >
                      🗑
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
