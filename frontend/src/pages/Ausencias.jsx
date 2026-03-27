// src/pages/Ausencias.jsx
import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import AusenciasPanel from "../components/AusenciasPanel";

export default function Ausencias() {
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  const [profesores, setProfesores] = useState([]);
  const [ausencias, setAusencias] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [prof, aus] = await Promise.all([
        API.get("/profesores"),
        API.get(`/ausencias?fecha=${fecha}`),
      ]);

      setProfesores(prof.data);
      setAusencias(aus.data);
    } catch (error) {
      console.error("Error cargando ausencias:", error);
    } finally {
      setLoading(false);
    }
  }, [fecha]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="fade-up">
      <h2 className="mb-3">Gestión de Ausencias</h2>

      {loading && <div className="text-muted mb-3">Cargando...</div>}

      <AusenciasPanel
        fecha={fecha}
        setFecha={setFecha}
        profesores={profesores}
        ausencias={ausencias}
        loadData={loadData}
      />
    </div>
  );
}
