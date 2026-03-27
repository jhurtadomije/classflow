// controllers/sesionesController.js
const pool = require("../config/db");

// 📄 Obtener todas
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM sesiones
      ORDER BY orden ASC
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo sesiones" });
  }
};

// ➕ Crear sesión (SOLO ADMIN)
exports.create = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { nombre, hora_inicio, hora_fin, orden } = req.body;

    if (!nombre || !hora_inicio || !hora_fin) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // 🔴 VALIDAR QUE NO SE SOLAPE
    const [conflict] = await pool.query(`
      SELECT id FROM sesiones
      WHERE (
        (hora_inicio <= ? AND hora_fin > ?) OR
        (hora_inicio < ? AND hora_fin >= ?) OR
        (hora_inicio >= ? AND hora_fin <= ?)
      )
    `, [
      hora_inicio, hora_inicio,
      hora_fin, hora_fin,
      hora_inicio, hora_fin
    ]);

    if (conflict.length > 0) {
      return res.status(400).json({
        error: "Horario solapado con otra sesión"
      });
    }

    const [result] = await pool.query(`
      INSERT INTO sesiones (nombre, hora_inicio, hora_fin, orden)
      VALUES (?, ?, ?, ?)
    `, [
      nombre,
      hora_inicio,
      hora_fin,
      orden || 0
    ]);

    res.json({ ok: true, id: result.insertId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando sesión" });
  }
};

// ❌ Eliminar (SOLO ADMIN + VALIDACIÓN)
exports.remove = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { id } = req.params;

    // 🔍 EXISTE?
    const [[sesion]] = await pool.query(
      "SELECT id FROM sesiones WHERE id = ?",
      [id]
    );

    if (!sesion) {
      return res.status(404).json({ error: "No encontrada" });
    }

    // 🔴 EN USO?
    const [uso] = await pool.query(`
      SELECT id FROM horarios WHERE sesion_id = ? LIMIT 1
    `, [id]);

    if (uso.length > 0) {
      return res.status(400).json({
        error: "No se puede eliminar, sesión en uso"
      });
    }

    await pool.query("DELETE FROM sesiones WHERE id = ?", [id]);

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error eliminando sesión" });
  }
};