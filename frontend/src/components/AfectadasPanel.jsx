import { useEffect, useState } from "react";
import API from "../services/api";

export default function AfectadasPanel({ fecha }) {
  const [afectadas, setAfectadas] = useState([]);
  const [sugerencias, setSugerencias] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingClase, setLoadingClase] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadAfectadas = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/horarios/afectadas?fecha=${fecha}`);
      setAfectadas(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAfectadas();
  }, [fecha]);

  if (user?.rol !== "admin") return null;

  // 🔥 eliminar duplicados
  const afectadasUnicas = Object.values(
    afectadas.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {})
  );

  const loadSugerencias = async (clase) => {
    const key = clase.id;

    if (sugerencias[key]) return;

    try {
      setLoadingClase(key);

      const res = await API.get(
        `/sustituciones/sugerencias?horario_id=${clase.id}&fecha=${fecha}`
      );

      setSugerencias((prev) => ({
        ...prev,
        [key]: res.data,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingClase(null);
    }
  };

  const asignarSustituto = async (clase, profesor_id) => {
    try {
      setLoadingClase(clase.id);

      await API.post("/sustituciones", {
        horario_id: clase.id,
        profesor_id,
        fecha,
      });

      await loadAfectadas();

      setSugerencias((prev) => {
        const copy = { ...prev };
        delete copy[clase.id];
        return copy;
      });

    } catch (error) {
      alert("Error asignando sustituto");
    } finally {
      setLoadingClase(null);
    }
  };

  return (
    <div className="card p-3 mb-3 shadow-sm border-0 fade-up">
      
      {/* 🔥 HEADER PRO */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-danger mb-0">
          Clases afectadas
        </h5>

        <span className="badge bg-danger">
          {afectadasUnicas.length}
        </span>
      </div>

      {loading && (
        <div className="text-center p-3 text-muted">
          Cargando incidencias...
        </div>
      )}

      {!loading && afectadasUnicas.length === 0 && (
        <div className="text-muted">No hay incidencias</div>
      )}

      {afectadasUnicas.map((c) => {
        const yaAsignado = c.sustituto;

        const sugerenciasUnicas = Object.values(
          (sugerencias[c.id] || []).reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {})
        );

        return (
          <div
            key={c.id}
            className="p-3 mb-2 rounded transition-all"
            style={{
              background: yaAsignado ? "#f0fdf4" : "#fff5f5",
              borderLeft: `5px solid ${
                yaAsignado ? "#22c55e" : "#dc2626"
              }`,
              transition: "all 0.2s ease"
            }}
          >
            <strong>{c.asignatura}</strong>

            <div className="small text-muted">
              {c.grupo} · {c.dia} · {c.hora}
            </div>

            <div className="small text-muted">
              👤 {c.profesor}
            </div>

            {/* ✅ YA SUSTITUIDO */}
            {yaAsignado && (
              <div className="text-success mt-2 fw-semibold">
                ✔ Sustituido por {c.sustituto}
              </div>
            )}

            {/* 🔥 SIN SUSTITUTO */}
            {!yaAsignado && (
              <>
                <button
                  className="btn btn-sm btn-warning mt-2"
                  onClick={() => loadSugerencias(c)}
                  disabled={loadingClase === c.id}
                >
                  {loadingClase === c.id
                    ? "Cargando..."
                    : "Asignar sustituto"}
                </button>

                {sugerencias[c.id] && (
                  <div className="mt-2">
                    {sugerenciasUnicas.length === 0 && (
                      <div className="text-muted small">
                        No hay profesores disponibles
                      </div>
                    )}

                    {sugerenciasUnicas.map((p) => (
                      <div
                        key={`${c.id}-${p.id}`}
                        className="d-flex justify-content-between align-items-center mb-1"
                      >
                        <span>{p.nombre}</span>

                        <button
                          className="btn btn-sm btn-success"
                          onClick={() =>
                            asignarSustituto(c, p.id)
                          }
                          disabled={loadingClase === c.id}
                        >
                          ✔
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}