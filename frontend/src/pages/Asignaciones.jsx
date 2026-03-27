import { useEffect, useState } from "react";
import API from "../services/api";

export default function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState([]);

  const [profesores, setProfesores] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [grupos, setGrupos] = useState([]);

  const [profesorId, setProfesorId] = useState("");
  const [asignaturaId, setAsignaturaId] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [grupoId, setGrupoId] = useState("");

  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [asig, prof, asigBase, cur, grp] = await Promise.all([
        API.get(`/asignaciones?curso_id=${cursoId || 1}`),
        API.get("/profesores"),
        API.get("/asignaturas"),
        API.get("/cursos"),
        API.get("/grupos"),
      ]);

      setAsignaciones(asig.data);
      setProfesores(prof.data);
      setAsignaturas(asigBase.data);
      setCursos(cur.data);
      setGrupos(grp.data);

      // 🔥 AHORA SÍ EXISTE cur
      if (!cursoId && cur.data.length > 0) {
        setCursoId(cur.data[0].id);
      }
    } catch (error) {
      console.error("Error cargando asignaciones:", error);
    }
  };

  useEffect(() => {
    load();
  }, [cursoId]);

  // 🔥 FILTRAR ASIGNATURAS SEGÚN PROFESOR
  const asignaturasFiltradas = asignaturas.filter((a) =>
    profesores
      .find((p) => p.id == profesorId)
      ?.asignaturas?.some((pa) => pa.id === a.id),
  );

  // ➕ CREAR
  const crear = async () => {
    if (!profesorId || !asignaturaId || !cursoId || !grupoId) {
      alert("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      await API.post("/asignaciones", {
        profesor_id: Number(profesorId),
        asignatura_id: Number(asignaturaId),
        curso_id: Number(cursoId),
        grupo_id: Number(grupoId),
      });

      setAsignaturaId("");
      load();
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.error || "Error creando asignación");
    } finally {
      setLoading(false);
    }
  };

  // ❌ ELIMINAR
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar asignación?")) return;

    await API.delete(`/asignaciones/${id}`);
    load();
  };

  return (
    <div className="fade-up">
      <h2 className="mb-3">Asignaciones</h2>

      {/* FILTRO CURSO */}
      <div className="card p-3 mb-3 shadow-sm border-0">
        <div className="row g-2">
          <div className="col-md-3">
            <select
              className="form-select"
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
            >
              <option value="">Seleccionar curso</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="card p-3 mb-3 shadow-sm border-0">
        <h5>Nueva asignación</h5>

        <div className="row g-2">
          {/* PROFESOR */}
          <div className="col-md-3">
            <select
              className="form-select"
              value={profesorId}
              onChange={(e) => setProfesorId(e.target.value)}
            >
              <option value="">Profesor</option>
              {profesores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* ASIGNATURA */}
          <div className="col-md-3">
            <select
              className="form-select"
              value={asignaturaId}
              onChange={(e) => setAsignaturaId(e.target.value)}
              disabled={!profesorId}
            >
              <option value="">Asignatura</option>

              {asignaturasFiltradas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* GRUPO */}
          <div className="col-md-3">
            <select
              className="form-select"
              value={grupoId}
              onChange={(e) => setGrupoId(e.target.value)}
            >
              <option value="">
                {cursoId ? "Seleccionar grupo" : "Selecciona curso primero"}
              </option>

              {cursoId &&
                grupos
                  .filter((g) => g.curso_id == cursoId)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
            </select>
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
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Profesor</th>
              <th>Asignatura</th>
              <th>Grupo</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {asignaciones.map((a) => (
              <tr key={a.id}>
                <td>{a.profesor}</td>

                <td>
                  <span
                    style={{
                      background: a.color || "#64748b",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      color: "#fff",
                    }}
                  >
                    {a.asignatura}
                  </span>
                </td>

                <td>{a.grupo}</td>

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
