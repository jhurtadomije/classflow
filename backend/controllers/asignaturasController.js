// controllers/asignaturasController.js
const pool = require("../config/db");

// 📄 Obtener todas (solo activas)
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM asignaturas
      WHERE activa = 1
      ORDER BY nombre
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo asignaturas" });
  }
};

// 🔍 Obtener una por id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[asignatura]] = await pool.query(
      `SELECT * FROM asignaturas WHERE id = ?`,
      [id]
    );

    if (!asignatura) {
      return res.status(404).json({ error: "Asignatura no encontrada" });
    }

    res.json(asignatura);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo asignatura" });
  }
};

// ➕ Crear (SOLO ADMIN)
exports.create = async (req, res) => {
  try {
    // 🔐 validar user
    if (!req.user || req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    let { nombre, color } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "Nombre requerido" });
    }

    nombre = nombre.trim();

    // 🔥 color por defecto SI NO VIENE
    if (!color) {
      color = "#3b82f6"; // azul por defecto
    }

    // 🔍 comprobar duplicado
    const [exist] = await pool.query(
      "SELECT id FROM asignaturas WHERE nombre = ?",
      [nombre]
    );

    if (exist.length > 0) {
      return res.status(400).json({ error: "Asignatura ya existe" });
    }

    // ➕ INSERT seguro
    const [result] = await pool.query(
      "INSERT INTO asignaturas (nombre, color, activa) VALUES (?, ?, 1)",
      [nombre, color]
    );

    res.json({ ok: true, id: result.insertId });

  } catch (error) {
    console.error("ERROR CREATE ASIGNATURA:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Editar (SOLO ADMIN)
exports.update = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { id } = req.params;
    const { nombre, color } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "Nombre requerido" });
    }

    const nombreLimpio = nombre.trim();

    const [[asignatura]] = await pool.query(
      "SELECT id FROM asignaturas WHERE id = ?",
      [id]
    );

    if (!asignatura) {
      return res.status(404).json({ error: "Asignatura no encontrada" });
    }

    const [duplicada] = await pool.query(
      "SELECT id FROM asignaturas WHERE nombre = ? AND id != ?",
      [nombreLimpio, id]
    );

    if (duplicada.length > 0) {
      return res.status(400).json({ error: "Ya existe otra asignatura con ese nombre" });
    }

    await pool.query(
      "UPDATE asignaturas SET nombre = ?, color = ? WHERE id = ?",
      [nombreLimpio, color || null, id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error actualizando asignatura" });
  }
};

// ❌ Eliminar (SOFT DELETE + VALIDACIÓN)
exports.remove = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { id } = req.params;

    const [[asignatura]] = await pool.query(
      "SELECT id FROM asignaturas WHERE id = ?",
      [id]
    );

    if (!asignatura) {
      return res.status(404).json({ error: "Asignatura no encontrada" });
    }

    const [uso] = await pool.query(
      "SELECT id FROM asignaciones WHERE asignatura_id = ? LIMIT 1",
      [id]
    );

    if (uso.length > 0) {
      return res.status(400).json({
        error: "No se puede eliminar, está en uso"
      });
    }

    await pool.query(
      "UPDATE asignaturas SET activa = 0 WHERE id = ?",
      [id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error eliminando asignatura" });
  }
};