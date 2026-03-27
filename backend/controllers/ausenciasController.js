// controllers/ausenciasController.js
const pool = require("../config/db");

// 📄 Obtener ausencias por fecha (CON SESIONES)
exports.getByFecha = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ error: "Fecha requerida" });
    }

    let query = `
      SELECT 
        a.*,
        p.nombre AS profesor,
        GROUP_CONCAT(ad.sesion_id) AS sesiones_ids
      FROM ausencias a
      JOIN profesores p ON a.profesor_id = p.id
      LEFT JOIN ausencias_detalle ad ON ad.ausencia_id = a.id
      LEFT JOIN sesiones s ON ad.sesion_id = s.id
      WHERE a.fecha = ?
    `;

    const params = [fecha];

    if (req.user.rol === "profesor") {
      query += " AND a.profesor_id = ?";
      params.push(req.user.profesor_id);
    }

    query += " GROUP BY a.id, p.nombre";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo ausencias" });
  }
};

// ➕ Crear ausencia (CON TRAMOS)
exports.create = async (req, res) => {
  try {
    let { profesor_id, fecha, motivo, sesiones } = req.body;

    if (req.user.rol === "profesor") {
      profesor_id = req.user.profesor_id;
    }

    if (!profesor_id || !fecha) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // 🔍 BUSCAR SI YA EXISTE
    const [[existente]] = await pool.query(
      `SELECT id FROM ausencias WHERE profesor_id = ? AND fecha = ?`,
      [profesor_id, fecha],
    );

    let ausenciaId;

    if (existente) {
      // 🔁 reutilizar
      ausenciaId = existente.id;
    } else {
      // ➕ crear nueva
      const [result] = await pool.query(
        `
        INSERT INTO ausencias (profesor_id, fecha, motivo)
        VALUES (?, ?, ?)
      `,
        [profesor_id, fecha, motivo || null],
      );

      ausenciaId = result.insertId;
    }

    // 🔥 INSERT SESIONES (SIN DUPLICAR)
    // 🔥 NORMALIZAR SESIONES
    let sesionesArray = [];

    if (Array.isArray(sesiones)) {
      sesionesArray = sesiones;
    }

    // 🔥 SI NO VIENEN SESIONES → AUSENCIA COMPLETA
    if (sesionesArray.length === 0) {
      const [todas] = await pool.query("SELECT id FROM sesiones");
      sesionesArray = todas.map((s) => s.id);
    }

    // 🔥 INSERTAR
    for (const s of sesionesArray) {
      await pool.query(
        `
    INSERT IGNORE INTO ausencias_detalle (ausencia_id, sesion_id)
    VALUES (?, ?)
  `,
        [ausenciaId, s],
      );
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando ausencia" });
  }
};

// ❌ Eliminar ausencia
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const [[ausencia]] = await pool.query(
      "SELECT * FROM ausencias WHERE id = ?",
      [id],
    );

    if (!ausencia) {
      return res.status(404).json({ error: "No encontrada" });
    }

    if (
      req.user.rol === "profesor" &&
      ausencia.profesor_id !== req.user.profesor_id
    ) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // 🔥 BORRADO EN CASCADA (gracias a FK)
    await pool.query("DELETE FROM ausencias WHERE id = ?", [id]);

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error eliminando ausencia" });
  }
};
