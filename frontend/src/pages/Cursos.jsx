import { useEffect, useState } from "react";
import API from "../services/api";

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [nombre, setNombre] = useState("");

  const load = async () => {
    const res = await API.get("/cursos");
    setCursos(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const crear = async () => {
    if (!nombre) return alert("Nombre requerido");

    await API.post("/cursos", { nombre });
    setNombre("");
    load();
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar curso?")) return;

    try {
      await API.delete(`/cursos/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error);
    }
  };

  return (
    <div className="fade-up">
      <h2>Cursos</h2>

      <div className="card p-3 mb-3">
        <input
          className="form-control mb-2"
          placeholder="Nombre (Ej: 1º ESO)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <button className="btn btn-primary" onClick={crear}>
          Crear
        </button>
      </div>

      <table className="table">
        <tbody>
          {cursos.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => eliminar(c.id)}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}