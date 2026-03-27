// controllers/profesorAsignaturasController.js
const pool = require("../config/db");

exports.getByProfesor = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT a.id, a.nombre, a.color
      FROM profesor_asignaturas pa
      INNER JOIN asignaturas a ON a.id = pa.asignatura_id
      WHERE pa.profesor_id = ? AND a.activa = 1
      ORDER BY a.nombre
    `, [id]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo asignaturas del profesor" });
  }
};

exports.updateProfesorAsignaturas = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { id } = req.params;
    const { asignaturas } = req.body;

    if (!Array.isArray(asignaturas)) {
      return res.status(400).json({ error: "El campo asignaturas debe ser un array" });
    }

    const [[profesor]] = await conn.query(
      "SELECT id FROM profesores WHERE id = ?",
      [id]
    );

    if (!profesor) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

    await conn.beginTransaction();

    await conn.query(
      "DELETE FROM profesor_asignaturas WHERE profesor_id = ?",
      [id]
    );

    for (const asignaturaId of asignaturas) {
      await conn.query(
        `INSERT INTO profesor_asignaturas (profesor_id, asignatura_id)
         VALUES (?, ?)`,
        [id, asignaturaId]
      );
    }

    await conn.commit();

    res.json({ ok: true });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Error actualizando asignaturas del profesor" });
  } finally {
    conn.release();
  }
};