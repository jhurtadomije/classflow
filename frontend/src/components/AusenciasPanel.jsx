import { useState } from "react";
import API from "../services/api";
import AusenciaModal from "./AusenciaModal";

export default function AusenciasPanel({
  fecha,
  setFecha,
  profesores,
  ausencias,
  loadData
}) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const esProfesor = user?.rol === "profesor";

  const [modalOpen, setModalOpen] = useState(false);
  const [profSeleccionado, setProfSeleccionado] = useState(null);

  // 🔍 FILTRAR
  const ausenciasFiltradas = esProfesor
    ? ausencias.filter(a => a.profesor_id === user.profesor_id)
    : ausencias;

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar ausencia?")) return;

    try {
      await API.delete(`/ausencias/${id}`);
      loadData();
    } catch {
      alert("Error eliminando");
    }
  };

  return (
    <div className="card p-3 mb-3 shadow-sm border-0">
      <h5 className="mb-3">Ausencias</h5>

      {/* 📅 FECHA */}
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="form-control mb-3 w-auto"
      />

      {/* 👨‍💼 ADMIN */}
      {!esProfesor && (
        <>
          <select
            className="form-select mb-2"
            onChange={(e) => setProfSeleccionado(Number(e.target.value))}
          >
            <option value="">Seleccionar profesor</option>
            {profesores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>

          <button
            className="btn btn-warning mb-3"
            disabled={!profSeleccionado}
            onClick={() => setModalOpen(true)}
          >
            Añadir ausencia
          </button>
        </>
      )}

      {/* 👨‍🏫 PROFESOR */}
      {esProfesor && (
        <button
          className="btn btn-warning mb-3"
          onClick={() => {
            setProfSeleccionado(user.profesor_id);
            setModalOpen(true);
          }}
        >
          Notificar mi ausencia
        </button>
      )}

      {/* 📋 LISTADO */}
      {ausenciasFiltradas.length === 0 && (
        <div className="text-muted">Sin ausencias</div>
      )}

      {ausenciasFiltradas.map((a) => (
        <div
          key={a.id}
          className="d-flex justify-content-between align-items-center p-2 mb-1 rounded"
          style={{ background: "#f1f5f9" }}
        >
          <span>
            👤 {a.profesor}
            {a.sesiones && (
              <span className="ms-2 text-muted small">
                ({a.sesiones})
              </span>
            )}
          </span>

          {!esProfesor && (
            <button
              className="btn btn-sm btn-danger"
              onClick={() => eliminar(a.id)}
            >
              ❌
            </button>
          )}
        </div>
      ))}

      {/* 🔥 MODAL */}
      <AusenciaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={loadData}
        profesorId={profSeleccionado}
      />
    </div>
  );
}