// controllers/asignacionesController.js
const pool = require("../config/db");

// 🔍 Obtener asignaciones por curso
exports.getAll = async (req, res) => {
  try {
    const { curso_id, grupo_id } = req.query;

    let where = [];
    let params = [];

    if (curso_id) {
      where.push("a.curso_id = ?");
      params.push(curso_id);
    }

    if (grupo_id) {
      where.push("a.grupo_id = ?");
      params.push(grupo_id);
    }

    const whereClause = where.length ? "WHERE " + where.join(" AND ") : "";

    const [rows] = await pool.query(`
      SELECT 
        a.*, 
        p.nombre AS profesor,
        asig.nombre AS asignatura,
        asig.color,
        g.nombre AS grupo,
        c.nombre AS curso
      FROM asignaciones a
      JOIN profesores p ON a.profesor_id = p.id
      JOIN asignaturas asig ON a.asignatura_id = asig.id
      JOIN grupos g ON a.grupo_id = g.id
      JOIN cursos c ON a.curso_id = c.id
      ${whereClause}
      ORDER BY c.nombre, g.nombre, asig.nombre
    `, params);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo asignaciones" });
  }
};

// ➕ Crear asignación (SOLO ADMIN)
exports.create = async (req, res) => {
  try {
    // 🔐 CONTROL DE ROL
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { curso_id, profesor_id, asignatura_id, grupo_id, horas_semana } = req.body;

    if (!curso_id || !profesor_id || !asignatura_id || !grupo_id) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // 🔍 VALIDAR EXISTENCIA
    const [[prof]] = await pool.query(
      "SELECT id FROM profesores WHERE id = ?",
      [profesor_id]
    );

    if (!prof) {
      return res.status(400).json({ error: "Profesor no existe" });
    }

    // 🔴 EVITAR DUPLICADO (misma asignatura en mismo grupo)
    const [exist] = await pool.query(`
      SELECT * FROM asignaciones
      WHERE curso_id = ? AND grupo_id = ? AND asignatura_id = ?
    `, [curso_id, grupo_id, asignatura_id]);

    if (exist.length > 0) {
      return res.status(400).json({ error: "Asignación duplicada" });
    }

    const [result] = await pool.query(`
      INSERT INTO asignaciones 
      (curso_id, profesor_id, asignatura_id, grupo_id, horas_semana)
      VALUES (?, ?, ?, ?, ?)
    `, [curso_id, profesor_id, asignatura_id, grupo_id, horas_semana || 0]);

    res.json({ ok: true, id: result.insertId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando asignación" });
  }
};

// ❌ Eliminar (SOLO ADMIN)
exports.remove = async (req, res) => {
  try {
    // 🔐 CONTROL DE ROL
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { id } = req.params;

    // 🔍 VALIDAR QUE EXISTE
    const [[row]] = await pool.query(
      "SELECT id FROM asignaciones WHERE id = ?",
      [id]
    );

    if (!row) {
      return res.status(404).json({ error: "Asignación no encontrada" });
    }

    await pool.query("DELETE FROM asignaciones WHERE id = ?", [id]);

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error eliminando asignación" });
  }
};