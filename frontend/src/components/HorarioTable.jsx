export default function HorarioTable({
  sesiones,
  dias,
  getCelda,
  asignaciones,
  asignar,
  eliminar,
  modoProfesor,
  soloLectura,
}) {
  const esSoloLectura = soloLectura || modoProfesor;

  return (
    <div className="table-responsive">
      <table className="table align-middle text-center">
        <thead className="table-light">
          <tr>
            <th style={{ width: "120px" }}>Hora</th>
            {dias.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sesiones.map((s) => (
            <tr key={s.id}>
              <td className="fw-semibold text-muted">{s.nombre}</td>

              {dias.map((d) => {
                const esRecreo = s.nombre.toLowerCase().includes("recreo");
                const celda = esRecreo ? null : getCelda(d, s.id);

                return (
                  <td
                    key={`${d}-${s.id}`}
                    style={{
                      height: "90px",
                      verticalAlign: "middle",
                    }}
                  >
                    {/* ☕ RECREO */}
                    {esRecreo && (
                      <div
                        className="fw-bold text-muted"
                        style={{
                          background: "#f1f5f9",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "6px",
                        }}
                      >
                        ☕ Recreo
                      </div>
                    )}

                    {/* ➕ CELDA VACÍA */}
                    {!celda && !esSoloLectura && !esRecreo && (
                      <select
                        className="form-select form-select-sm"
                        value=""
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!value) return;
                          asignar(d, s.id, value);
                          e.target.value = "";
                        }}
                      >
                        <option value="">＋</option>

                        {asignaciones.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.asignatura} - {a.profesor}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* 📚 CELDA CON CLASE */}
                    {celda && (
                      <div
                        className="p-2 rounded"
                        style={{
                          background: celda.color || "#64748b",
                          color: "#fff",
                          position: "relative",
                          height: "100%",
                          minHeight: "70px",
                        }}
                        title={`${celda.asignatura} - ${celda.profesor}${
                          celda.sustituto
                            ? ` (Sustituido por ${celda.sustituto})`
                            : celda.afectada
                              ? " (Profesor ausente)"
                              : ""
                        }`}
                      >
                        {/* 🔴 ICONO AUSENCIA */}
                        {!celda.sustituto && celda.afectada && (
                          <span
                            title="Profesor ausente"
                            style={{
                              position: "absolute",
                              top: "4px",
                              left: "4px",
                              fontSize: "16px",
                            }}
                          >
                            ⚠️
                          </span>
                        )}

                        {/* 🔁 ICONO SUSTITUCIÓN */}
                        {celda.sustituto && (
                          <span
                            title={`Sustituido por ${celda.sustituto}`}
                            style={{
                              position: "absolute",
                              top: "4px",
                              left: "4px",
                              fontSize: "14px",
                            }}
                          >
                            🔁
                          </span>
                        )}

                        {/* ❌ BOTÓN ELIMINAR */}
                        {!esSoloLectura && (
                          <button
                            className="btn btn-sm btn-light"
                            style={{
                              position: "absolute",
                              top: "4px",
                              right: "4px",
                              padding: "2px 6px",
                            }}
                            onClick={() => eliminar(celda.id)}
                          >
                            ✕
                          </button>
                        )}

                        {/* ASIGNATURA */}
                        <div
                          className="fw-bold small"
                          style={{ marginBottom: "4px" }}
                        >
                          {celda.asignatura}
                        </div>

                        {/* PROFESOR / GRUPO */}
                        <div className="small">
                          {celda.sustituto ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  opacity: 0.7,
                                  textDecoration: "line-through",
                                }}
                              >
                                👤 {celda.profesor}
                              </span>

                              <span style={{ fontWeight: "bold" }}>
                                🔁 {celda.sustituto}
                              </span>
                            </div>
                          ) : (
                            <>{modoProfesor ? celda.grupo : celda.profesor}</>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 👁 SOLO LECTURA VACÍO */}
                    {!celda && esSoloLectura && !esRecreo && (
                      <div className="text-muted small">—</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
