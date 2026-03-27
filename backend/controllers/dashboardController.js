// controllers/dashboardController.js
// controllers/dashboardController.js
const pool = require("../config/db");

const getDetalle = async (req, res) => {
  try {
    const { fecha } = req.query;

    const [ausentes] = await pool.query(`
      SELECT p.nombre
      FROM ausencias a
      JOIN profesores p ON a.profesor_id = p.id
      WHERE a.fecha = ?
    `, [fecha]);

    const [afectadas] = await pool.query(`
      SELECT h.id, asig.nombre as asignatura, g.nombre as grupo, h.dia, h.sesion_id
      FROM horarios h
      JOIN asignaciones a ON h.asignacion_id = a.id
      JOIN grupos g ON a.grupo_id = g.id
      JOIN asignaturas asig ON a.asignatura_id = asig.id
      WHERE a.profesor_id IN (
        SELECT profesor_id FROM ausencias WHERE fecha = ?
      )
    `, [fecha]);

    const [sustituciones] = await pool.query(`
      SELECT asig.nombre as asignatura, g.nombre as grupo, ps.nombre as sustituto
      FROM sustituciones s
      JOIN horarios h ON s.horario_id = h.id
      JOIN asignaciones a ON h.asignacion_id = a.id
      JOIN grupos g ON a.grupo_id = g.id
      JOIN asignaturas asig ON a.asignatura_id = asig.id
      JOIN profesores ps ON s.profesor_sustituto_id = ps.id
      WHERE s.fecha = ?
    `, [fecha]);

    res.json({ ausentes, afectadas, sustituciones });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error detalle dashboard" });
  }
};

module.exports = { getDetalle };