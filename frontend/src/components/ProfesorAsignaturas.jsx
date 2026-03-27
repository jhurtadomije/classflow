import { useEffect, useState } from "react";
import api from "../services/api";

export default function ProfesorAsignaturas({ profesorId }) {
  const [todas, setTodas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profesorId) cargarDatos();
  }, [profesorId]);

  const cargarDatos = async () => {
    try {
      const [resAsignaturas, resProfesor] = await Promise.all([
        api.get("/asignaturas"),
        api.get(`/profesores/${profesorId}/asignaturas`)
      ]);

      setTodas(resAsignaturas.data);
      setSeleccionadas(resProfesor.data.map(a => a.id));

    } catch (error) {
      console.error("Error cargando asignaturas", error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => {
    setSeleccionadas(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const guardar = async () => {
    try {
      await api.put(`/profesores/${profesorId}/asignaturas`, {
        asignaturas: seleccionadas
      });

      alert("Asignaturas actualizadas");
    } catch (error) {
      console.error(error);
      alert("Error guardando");
    }
  };

  if (loading) return <p>Cargando asignaturas...</p>;

  return (
    <div className="card p-3 mt-3">
      <h5>Asignaturas del profesor</h5>

      <div className="mt-3">
        {todas.map(a => (
          <div key={a.id} className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={seleccionadas.includes(a.id)}
              onChange={() => toggle(a.id)}
              id={`asig-${a.id}`}
            />
            <label className="form-check-label" htmlFor={`asig-${a.id}`}>
              {a.nombre}
            </label>
          </div>
        ))}
      </div>

      <button className="btn btn-primary mt-3" onClick={guardar}>
        Guardar cambios
      </button>
    </div>
  );
}