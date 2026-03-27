// controllers/sustitucionesController.js
const pool = require("../config/db");

// ➕ CREAR SUSTITUCIÓN
exports.create = async (req, res) => {
  try {
    // 🔐 SOLO ADMIN
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { horario_id, profesor_id, fecha } = req.body;

    if (!horario_id || !profesor_id || !fecha) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // 🔍 EXISTE CLASE?
    const [[clase]] = await pool.query(
      `
      SELECT h.*, a.profesor_id AS profesor_original
      FROM horarios h
      JOIN asignaciones a ON h.asignacion_id = a.id
      WHERE h.id = ?
    `,
      [horario_id],
    );

    if (!clase) {
      return res.status(404).json({ error: "Clase no encontrada" });
    }

    // 🔴 EVITAR QUE SE SUSTITUYA A SÍ MISMO
    if (clase.profesor_original == profesor_id) {
      return res.status(400).json({
        error: "El profesor no puede sustituirse a sí mismo",
      });
    }

    // 🔴 YA EXISTE SUSTITUCIÓN
    const [exist] = await pool.query(
      "SELECT id FROM sustituciones WHERE horario_id = ? AND fecha = ?",
      [horario_id, fecha],
    );

    if (exist.length > 0) {
      return res.status(400).json({ error: "Ya asignado" });
    }

    // 🔴 PROFESOR OCUPADO
    const [ocupado] = await pool.query(
      `
  SELECT h.id
  FROM horarios h
  JOIN asignaciones a ON h.asignacion_id = a.id
  WHERE h.dia = ? 
  AND h.sesion_id = ?
  AND a.profesor_id = ?
`,
      [clase.dia, clase.sesion_id, profesor_id],
    );

    if (ocupado.length > 0) {
      return res.status(400).json({
        error: "Profesor ocupado en esa hora",
      });
    }

    // 🔴 PROFESOR AUSENTE
    const [ausente] = await pool.query(
      `
      SELECT id FROM ausencias
      WHERE profesor_id = ? AND fecha = ?
    `,
      [profesor_id, fecha],
    );

    if (ausente.length > 0) {
      return res.status(400).json({
        error: "Profesor también ausente",
      });
    }

    const [conflicto] = await pool.query(`
  SELECT s.id
  FROM sustituciones s
  JOIN horarios h ON s.horario_id = h.id
  WHERE h.dia = ? AND h.sesion_id = ? 
  AND s.profesor_sustituto_id = ? 
  AND s.fecha = ?
`, [clase.dia, clase.sesion_id, profesor_id, fecha]);

    await pool.query(
      `
      INSERT INTO sustituciones (horario_id, profesor_sustituto_id, fecha)
      VALUES (?, ?, ?)
    `,
      [horario_id, profesor_id, fecha],
    );

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando sustitución" });
  }
};

// 🤖 SUGERENCIAS INTELIGENTES
exports.getSugerencias = async (req, res) => {
  try {
    const { horario_id, fecha } = req.query;

    if (!horario_id || !fecha) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const [[clase]] = await pool.query(`
      SELECT h.dia, h.sesion_id, h.curso_id, a.profesor_id, a.grupo_id
      FROM horarios h
      JOIN asignaciones a ON h.asignacion_id = a.id
      WHERE h.id = ?
    `, [horario_id]);

    if (!clase) return res.json([]);

    const [ocupados] = await pool.query(`
      SELECT a.profesor_id
      FROM horarios h
      JOIN asignaciones a ON h.asignacion_id = a.id
      WHERE h.dia = ? AND h.sesion_id = ?
    `, [clase.dia, clase.sesion_id]);

    const idsOcupados = ocupados.map(o => o.profesor_id);

    const [ausentes] = await pool.query(`
      SELECT profesor_id FROM ausencias WHERE fecha = ?
    `, [fecha]);

    const idsAusentes = ausentes.map(a => a.profesor_id);

    const excluir = [
      ...idsOcupados,
      ...idsAusentes,
      clase.profesor_id
    ];

    let disponibles;

    const placeholders = excluir.map(() => "?").join(",");

    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.nombre,

        MIN(
          CASE 
            WHEN a.grupo_id = ? THEN 1
            WHEN a.curso_id = ? THEN 2
            ELSE 3
          END
        ) as prioridad

      FROM profesores p
      LEFT JOIN asignaciones a ON a.profesor_id = p.id

      WHERE p.activo = 1
      ${excluir.length ? `AND p.id NOT IN (${placeholders})` : ""}

      GROUP BY p.id

      ORDER BY prioridad, p.nombre
    `, excluir.length
      ? [clase.grupo_id, clase.curso_id, ...excluir]
      : [clase.grupo_id, clase.curso_id]
    );

    disponibles = rows;

    res.json(disponibles);

  } catch (error) {
    console.error("Error sugerencias:", error);
    res.status(500).json({ error: "Error sugerencias" });
  }
};
