import { useEffect, useState } from "react";
import API from "../services/api";

export default function AusenciaModal({ open, onClose, onSave, profesorId }) {
  const [sesiones, setSesiones] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);

  const fecha = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (open) {
      API.get("/sesiones").then((res) => {
        setSesiones(res.data);
      });
    }
  }, [open]);

  const toggle = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  const guardar = async () => {
  try {
    if (seleccionadas.length === 0) {
      alert("Selecciona al menos una hora");
      return;
    }

    await API.post("/ausencias", {
      profesor_id: profesorId,
      fecha,
      sesiones: seleccionadas
    });

    // 🔥 esperar refresh REAL
    await onSave();

    // 🔥 limpiar estado
    setSeleccionadas([]);

    // 🔥 cerrar
    onClose();

  } catch (error) {
    console.error(error);
    alert("Error guardando ausencia");
  }
};
  if (!open) return null;

  return (
    <>
      {/* 🔥 BACKDROP CORRECTO */}
      <div className="modal-backdrop fade show"></div>

      {/* 🔥 MODAL */}
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content p-3">

            <h5 className="mb-3">Seleccionar horas de ausencia</h5>

            <div>
              {sesiones.map((s) => (
                <div key={s.id} className="form-check mb-1">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={seleccionadas.includes(s.id)}
                    onChange={() => toggle(s.id)}
                  />
                  <label className="form-check-label">
                    {s.nombre}
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-3 d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>

              <button className="btn btn-warning" onClick={guardar}>
                Guardar ausencia
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}