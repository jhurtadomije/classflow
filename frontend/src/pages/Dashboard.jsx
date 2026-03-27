// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState({
    ausentes: [],
    afectadas: [],
    sustituciones: [],
  });

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [sugerencias, setSugerencias] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await API.get(`/dashboard/detalle?fecha=${fecha}`);
      setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarSugerencias = async (horario_id) => {
    const res = await API.get(
      `/sustituciones/sugerencias?horario_id=${horario_id}&fecha=${fecha}`
    );

    setSugerencias((prev) => ({
      ...prev,
      [horario_id]: res.data,
    }));
  };

  return (
    <div>
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Centro de Control</h2>

        <input
          type="date"
          className="form-control w-auto"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      {/* KPIs */}
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="card p-3 shadow-sm border-0">
            <h6 className="text-muted">Ausentes</h6>
            <h3 className="text-danger">{data.ausentes.length}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm border-0">
            <h6 className="text-muted">Clases afectadas</h6>
            <h3 className="text-warning">{data.afectadas.length}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm border-0">
            <h6 className="text-muted">Sustituciones</h6>
            <h3 className="text-success">{data.sustituciones.length}</h3>
          </div>
        </div>
      </div>

      <div className="row">

        {/* AUSENTES */}
        <div className="col-md-4">
          <div className="card p-3 shadow-sm border-0">
            <h5 className="text-danger mb-3">Ausentes</h5>

            {data.ausentes.length === 0 && (
              <div className="text-muted">Sin ausencias</div>
            )}

            {data.ausentes.map((a, i) => (
              <div key={i} className="p-2 border-bottom">
                👤 {a.nombre}
              </div>
            ))}
          </div>
        </div>

        {/* AFECTADAS */}
        <div className="col-md-4">
          <div className="card p-3 shadow-sm border-0">
            <h5 className="text-warning mb-3">Clases afectadas</h5>

            {data.afectadas.map((c) => {
              const sustitucion = data.sustituciones.find(
                (s) => s.horario_id === c.id
              );

              return (
                <div key={c.id} className="mb-3 p-2 bg-light rounded">
                  <strong>{c.asignatura}</strong>

                  <div className="small text-muted">
                    {c.grupo} · {c.dia} · {c.sesion_id}
                  </div>

                  {sustitucion ? (
                    <div className="text-success mt-1">
                      ✔ {sustitucion.sustituto}
                    </div>
                  ) : (
                    <>
                      <button
                        className="btn btn-sm btn-outline-primary mt-2"
                        onClick={() => cargarSugerencias(c.id)}
                      >
                        Ver sustitutos
                      </button>

                      {sugerencias[c.id]?.map((p) => (
                        <div
                          key={p.id}
                          className="d-flex justify-content-between align-items-center mt-1"
                        >
                          <span>{p.nombre}</span>

                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => {
                              API.post("/sustituciones", {
                                horario_id: c.id,
                                profesor_id: p.id,
                                fecha,
                              }).then(load);
                            }}
                          >
                            ✔
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SUSTITUCIONES */}
        <div className="col-md-4">
          <div className="card p-3 shadow-sm border-0">
            <h5 className="text-success mb-3">Sustituciones</h5>

            {data.sustituciones.length === 0 && (
              <div className="text-muted">Sin sustituciones</div>
            )}

            {data.sustituciones.map((s, i) => (
              <div key={i} className="mb-2">
                <strong>{s.asignatura}</strong>
                <div className="small text-muted">
                  {s.grupo} → {s.sustituto}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}