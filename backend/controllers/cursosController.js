// controllers/cursosController.js
const pool = require("../config/db");

// 📄 GET
exports.getAll = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT * FROM cursos ORDER BY nombre
  `);

  res.json(rows);
};

// ➕ CREATE
exports.create = async (req, res) => {
  if (req.user.rol !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }

  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "Nombre requerido" });
  }

  const [exist] = await pool.query(
    "SELECT id FROM cursos WHERE nombre = ?",
    [nombre]
  );

  if (exist.length) {
    return res.status(400).json({ error: "Curso ya existe" });
  }

  const [result] = await pool.query(
    "INSERT INTO cursos (nombre) VALUES (?)",
    [nombre]
  );

  res.json({ ok: true, id: result.insertId });
};

// ❌ DELETE
exports.remove = async (req, res) => {
  const { id } = req.params;

  const [uso] = await pool.query(
    "SELECT id FROM grupos WHERE curso_id = ? LIMIT 1",
    [id]
  );

  if (uso.length) {
    return res.status(400).json({
      error: "No se puede eliminar, tiene grupos"
    });
  }

  await pool.query("DELETE FROM cursos WHERE id = ?", [id]);

  res.json({ ok: true });
};