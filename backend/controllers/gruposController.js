// controllers/gruposController.js
const pool = require("../config/db");

// 📄 Obtener todos (ordenados)
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
   SELECT g.*, 
         c.nombre AS curso,
         p.nombre AS tutor
  FROM grupos g
  LEFT JOIN cursos c ON c.id = g.curso_id
  LEFT JOIN profesores p ON p.id = g.tutor_id
  ORDER BY g.nombre
`);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo grupos" });
  }
};

// ➕ Crear grupo (SOLO ADMIN)
exports.create = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { nombre, curso_id, tutor_id } = req.body;

    // ✅ VALIDAR
    if (!nombre || !curso_id) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // ✅ EVITAR DUPLICADO
    const [exist] = await pool.query(
      "SELECT id FROM grupos WHERE nombre = ? AND curso_id = ?",
      [nombre, curso_id],
    );

    if (exist.length) {
      return res.status(400).json({
        error: "Grupo ya existe en ese curso",
      });
    }

    // 🔴 VALIDAR TUTOR ÚNICO
    if (tutor_id) {
      const [existTutor] = await pool.query(
        "SELECT id FROM grupos WHERE tutor_id = ?",
        [tutor_id],
      );

      if (existTutor.length > 0) {
        return res.status(400).json({
          error: "Este profesor ya es tutor de otro grupo",
        });
      }
    }

    // ✅ INSERT
    const [result] = await pool.query(
      "INSERT INTO grupos (nombre, curso_id, tutor_id) VALUES (?, ?, ?)",
      [nombre, curso_id, tutor_id || null],
    );

    res.json({ ok: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando grupo" });
  }
};

// ❌ Eliminar grupo (SOLO ADMIN + VALIDACIÓN)
exports.remove = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { id } = req.params;

    // 🔍 EXISTE?
    const [[grupo]] = await pool.query("SELECT id FROM grupos WHERE id = ?", [
      id,
    ]);

    if (!grupo) {
      return res.status(404).json({ error: "Grupo no encontrado" });
    }

    // 🔴 EN USO EN HORARIOS?
    const [usoHorarios] = await pool.query(
      "SELECT id FROM horarios WHERE grupo_id = ? LIMIT 1",
      [id],
    );

    if (usoHorarios.length > 0) {
      return res.status(400).json({
        error: "No se puede eliminar, grupo usado en horarios",
      });
    }

    // 🔴 EN USO EN ASIGNACIONES?
    const [usoAsignaciones] = await pool.query(
      "SELECT id FROM asignaciones WHERE grupo_id = ? LIMIT 1",
      [id],
    );

    if (usoAsignaciones.length > 0) {
      return res.status(400).json({
        error: "No se puede eliminar, grupo usado en asignaciones",
      });
    }

    await pool.query("DELETE FROM grupos WHERE id = ?", [id]);

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error eliminando grupo" });
  }
};
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, curso_id, tutor_id } = req.body;

    // 🔴 VALIDAR TUTOR ÚNICO (EXCEPTO EL MISMO GRUPO)
    if (tutor_id) {
      const [existTutor] = await pool.query(
        "SELECT id FROM grupos WHERE tutor_id = ? AND id != ?",
        [tutor_id, id],
      );

      if (existTutor.length > 0) {
        return res.status(400).json({
          error: "Este profesor ya es tutor de otro grupo",
        });
      }
    }

    await pool.query(
      "UPDATE grupos SET nombre=?, curso_id=?, tutor_id=? WHERE id=?",
      [nombre, curso_id, tutor_id || null, id],
    );

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error actualizando grupo" });
  }
};
