import { useEffect, useState } from "react";
import API from "../services/api";
import AusenciaModal from "../components/AusenciaModal";

export default function ProfesorPanel() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [clases, setClases] = useState([]);
  const [ausente, setAusente] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔥 FECHA INTELIGENTE
  const getFechaObjetivo = () => {
    const ahora = new Date();
    const hora = ahora.getHours();

    const fechaBase = new Date(ahora);

    if (hora >= 15) {
      fechaBase.setDate(fechaBase.getDate() + 1);
    }

    return fechaBase.toISOString().split("T")[0];
  };

  const fecha = getFechaObjetivo();

  // 🔥 DÍA TEXTO
  const getDiaSemana = (fechaStr) => {
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    return dias[new Date(fechaStr).getDay()];
  };

  const diaTexto = getDiaSemana(fecha);

  // 🔧 Parsear hora
  const getHoraInicio = (horaStr) => {
    if (!horaStr) return null;

    const inicio = horaStr.split("-")[0].trim();
    const [h, m] = inicio.split(":");

    return parseInt(h) + parseInt(m) / 60;
  };

  const load = async () => {
    try {
      setLoading(true);

      const [horario, aus] = await Promise.all([
        API.get(
          `/horarios/hoy?profesor_id=${user.profesor_id}&fecha=${fecha}`
        ),
        API.get(`/ausencias?fecha=${fecha}`),
      ]);

      setClases(horario.data);

      const esAusente = aus.data.some(
        (a) => a.profesor_id === user.profesor_id
      );

      setAusente(esAusente);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 IMPORTANTE: depende de fecha
  useEffect(() => {
    load();
  }, [fecha]);

  // 🧠 Hora actual
  const ahora = new Date();
  const horaActual = ahora.getHours() + ahora.getMinutes() / 60;

  // 🔥 Ordenar clases
  const clasesOrdenadas = [...clases].sort(
    (a, b) => getHoraInicio(a.hora) - getHoraInicio(b.hora)
  );

  // 🔥 Siguiente clase real
  const siguienteClase = clasesOrdenadas.find(
    (c) => getHoraInicio(c.hora) > horaActual
  );

  return (
    <div className="fade-up">
      <h2 className="mb-3">Mi jornada</h2>

      {/* 🔥 AUSENCIA */}
      <div className="card p-3 mb-3 shadow-sm border-0">
        {loading ? (
          <div className="text-muted">Cargando estado...</div>
        ) : (
          <button
            className={`btn ${ausente ? "btn-danger" : "btn-warning"}`}
            onClick={() => setModalOpen(true)}
          >
            {ausente ? "Modificar ausencia" : "Notificar ausencia"}
          </button>
        )}
      </div>

      {/* 🔥 CLASES */}
      <div className="card p-3 shadow-sm border-0">
        <h5 className="mb-3">Clases de {diaTexto}</h5>

        {loading && (
          <div className="text-muted">Cargando clases...</div>
        )}

        {!loading && clasesOrdenadas.length === 0 && (
          <div className="text-muted">
            No tienes clases este día
          </div>
        )}

        {clasesOrdenadas.map((c) => {
          const horaClase = getHoraInicio(c.hora);

          let estado = "pendiente";

          if (horaClase !== null) {
            if (horaActual >= horaClase && horaActual < horaClase + 1) {
              estado = "actual";
            } else if (siguienteClase && c.id === siguienteClase.id) {
              estado = "siguiente";
            } else if (horaActual > horaClase) {
              estado = "pasada";
            }
          }

          const estilos = {
            actual: {
              border: "#22c55e",
              bg: "#ecfdf5",
              label: "🟢 En curso",
            },
            siguiente: {
              border: "#f59e0b",
              bg: "#fffbeb",
              label: "🟡 Siguiente",
            },
            pendiente: {
              border: "#3b82f6",
              bg: "#eff6ff",
              label: "",
            },
            pasada: {
              border: "#94a3b8",
              bg: "#f1f5f9",
              label: "⚪ Finalizada",
            },
          };

          const estilo = estilos[estado];

          return (
            <div
              key={c.id}
              className="d-flex justify-content-between align-items-center p-3 mb-2 rounded"
              style={{
                background: estilo.bg,
                borderLeft: `6px solid ${estilo.border}`,
              }}
            >
              <div>
                <strong>{c.asignatura}</strong>
                <div className="small text-muted">{c.grupo}</div>

                {estilo.label && (
                  <div className="small mt-1 fw-semibold">
                    {estilo.label}
                  </div>
                )}
              </div>

              <div className="badge bg-dark">
                {c.hora}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔥 MODAL */}
      <AusenciaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={load}
        profesorId={user.profesor_id}
      />
    </div>
  );
}