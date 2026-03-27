import { useEffect, useState, useCallback } from "react";
import API from "../services/api";

import HorarioTable from "../components/HorarioTable";
import AusenciasPanel from "../components/AusenciasPanel";
import AfectadasPanel from "../components/AfectadasPanel";

const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export default function Horarios() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const esProfesor = user?.rol === "profesor";

  // DATA
  const [horarios, setHorarios] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);

  const [grupos, setGrupos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [profesores, setProfesores] = useState([]);

  // UI
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");

  const [profesorSeleccionado, setProfesorSeleccionado] = useState("");
  const [modoProfesor, setModoProfesor] = useState(false);

  const [ausencias, setAusencias] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  const [loading, setLoading] = useState(false);

  // 🔥 FORZAR PROFESOR
  useEffect(() => {
    if (esProfesor && user.profesor_id) {
      setModoProfesor(true);
      setProfesorSeleccionado(user.profesor_id);
    }
  }, [esProfesor, user.profesor_id]);

  // 🔄 LOAD
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [ses, gr, cu, prof, aus] = await Promise.all([
        API.get("/sesiones"),
        API.get("/grupos"),
        API.get("/cursos"),
        API.get("/profesores"),
        API.get(`/ausencias?fecha=${fecha}`),
      ]);

      setSesiones(ses.data);
      setGrupos(gr.data);
      setCursos(cu.data);
      setProfesores(prof.data);
      setAusencias(aus.data);

      // AUTOINIT
      let cursoId = cursoSeleccionado;
      let grupoId = grupoSeleccionado;

      if (!cursoId && cu.data.length) {
        cursoId = cu.data[0].id;
        setCursoSeleccionado(cursoId);
      }

      if (!modoProfesor && !grupoId && gr.data.length) {
        grupoId = gr.data[0].id;
        setGrupoSeleccionado(grupoId);
      }

      let res;

      if (modoProfesor && profesorSeleccionado) {
        res = await API.get(
  `/horarios?grupo_id=${grupoId}&curso_id=${cursoId}&fecha=${fecha}`
);
      } else {
        if (!grupoId) return;

        res = await API.get(
          `/horarios?grupo_id=${grupoId}&curso_id=${cursoId}`,
        );
      }

      const horariosBase = res.data;

      // 🔥 PROCESAR AFECTADAS
      const [year, month, day] = fecha.split("-");
const fechaObj = new Date(year, month - 1, day);

const diasSemana = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sabado",
];

const diaSeleccionado = diasSemana[fechaObj.getDay()];

const horariosProcesados = horariosBase.map((h) => {
  const ausencia = aus.data.find((a) => a.profesor_id === h.profesor_id);

  let afectada = false;

  if (ausencia?.sesiones_ids) {
    const sesionesAusencia = ausencia.sesiones_ids
      .split(",")
      .map((s) => parseInt(s.trim(), 10));

    if (
      sesionesAusencia.includes(h.sesion_id) &&
      h.dia?.toLowerCase().trim() === diaSeleccionado
    ) {
      afectada = true;
    }
  }

  return {
    ...h,
    afectada,
    sustituto: h.sustituto || null,
  };
});

      setHorarios(horariosProcesados);

      const asig = await API.get(
        `/asignaciones?curso_id=${cursoId}&grupo_id=${grupoId}`,
      );

      setAsignaciones(asig.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, [
    grupoSeleccionado,
    cursoSeleccionado,
    modoProfesor,
    profesorSeleccionado,
    fecha,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 🔍 CELDA
  const getCelda = (dia, sesion_id) =>
    horarios.find(
      (h) =>
        h.dia.toLowerCase() === dia.toLowerCase() && h.sesion_id === sesion_id,
    );

  // 🔥 DETECTAR INCIDENCIAS
  const hayIncidencias = horarios.some((h) => h.afectada);

  // 🔥 ASIGNAR
  const asignar = async (dia, sesion_id, asignacion_id) => {
    if (esProfesor) return;

    const celda = getCelda(dia, sesion_id);

    try {
      if (!asignacion_id || asignacion_id === "0") {
        if (celda?.id) {
          await API.delete(`/horarios/${celda.id}`);
        }
      } else {
        await API.post("/horarios", {
          curso_id: Number(cursoSeleccionado),
          grupo_id: Number(grupoSeleccionado),
          dia,
          sesion_id: Number(sesion_id),
          asignacion_id: Number(asignacion_id),
        });
      }

      await loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error al asignar");
    }
  };

  // ❌ ELIMINAR
  const eliminar = async (id) => {
    if (esProfesor) return;

    try {
      await API.delete(`/horarios/${id}`);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error eliminando");
    }
  };

  return (
    <>
      <div className="fade-up d-flex justify-content-between align-items-center mb-3">
        <h2>
          {esProfesor ? "Mi horario semanal" : "Horarios"}
          {hayIncidencias && !esProfesor && (
            <span className="badge bg-danger ms-2">Incidencias</span>
          )}
        </h2>

        {esProfesor && (
          <div className="badge bg-primary p-2">
            Vista profesor: {user.nombre}
          </div>
        )}
      </div>

      {!esProfesor && (
        <div className="card shadow-sm border-0 p-3 mb-3">
          <div className="row g-3">
            <div className="col-md-3">
              <label>Curso</label>
              <select
                className="form-select"
                value={cursoSeleccionado}
                onChange={(e) => setCursoSeleccionado(Number(e.target.value))}
              >
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label>Grupo</label>
              <select
                className="form-select"
                value={grupoSeleccionado}
                onChange={(e) => setGrupoSeleccionado(Number(e.target.value))}
              >
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label>Profesor</label>
              <select
                className="form-select"
                onChange={(e) => {
                  const id = e.target.value;

                  if (!id) {
                    setModoProfesor(false);
                    setProfesorSeleccionado(null);
                    return;
                  }

                  setProfesorSeleccionado(Number(id));
                  setModoProfesor(true);
                }}
              >
                <option value="">Vista por grupos</option>
                {profesores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {!esProfesor && <AfectadasPanel fecha={fecha} />}

      <div className="card p-3 shadow-sm border-0">
        {loading ? (
          <div className="text-center p-5">
            <strong>Cargando...</strong>
          </div>
        ) : (
          <HorarioTable
            horarios={horarios}
            sesiones={sesiones}
            dias={dias}
            getCelda={getCelda}
            asignaciones={asignaciones}
            asignar={asignar}
            eliminar={eliminar}
            modoProfesor={modoProfesor}
            soloLectura={esProfesor}
          />
        )}
      </div>
    </>
  );
}
