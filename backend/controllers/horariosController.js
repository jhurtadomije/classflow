// controllers/horariosController.js
const pool = require("../config/db");

// 📄 HORARIO POR GRUPO
exports.getByGrupo = async (req, res) => {
  try {
    const { grupo_id, curso_id, fecha } = req.query;

    if (!grupo_id || !curso_id) {
      return res.status(400).json({ error: "Datos requeridos" });
    }

    const fechaFiltro = fecha || new Date().toISOString().split("T")[0];

    const [rows] = await pool.query(
      `
      SELECT 
        h.*, 
        a.id as asignacion_id,
        p.id as profesor_id,
        p.nombre as profesor,
        asig.nombre as asignatura,
        asig.color,
        ps.nombre AS sustituto

      FROM horarios h
      JOIN asignaciones a ON h.asignacion_id = a.id
      JOIN profesores p ON a.profesor_id = p.id
      JOIN asignaturas asig ON a.asignatura_id = asig.id

      LEFT JOIN sustituciones s 
        ON s.horario_id = h.id AND s.fecha = ?

      LEFT JOIN profesores ps 
        ON s.profesor_sustituto_id = ps.id

      WHERE h.grupo_id = ? AND h.curso_id = ?
    `,
      [fechaFiltro, grupo_id, curso_id]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo horarios" });
  }
};

exports.getByProfesor = async (req, res) => {
  try {
    const { curso_id, fecha } = req.query;

    let profesor_id = req.query.profesor_id;

    if (req.user.rol === "profesor") {
      profesor_id = req.user.profesor_id;
    }

    const fechaFiltro = fecha || new Date().toISOString().split("T")[0];

    const [rows] = await pool.query(
      `
      SELECT 
        h.*, 
        p.id as profesor_id,
        g.nombre AS grupo,
        asig.nombre AS asignatura,
        asig.color,
        ps.nombre AS sustituto

      FROM horarios h
      JOIN asignaciones a ON h.asignacion_id = a.id
      JOIN profesores p ON a.profesor_id = p.id
      JOIN grupos g ON a.grupo_id = g.id
      JOIN asignaturas asig ON a.asignatura_id = asig.id

      LEFT JOIN sustituciones s 
        ON s.horario_id = h.id AND s.fecha = ?

      LEFT JOIN profesores ps 
        ON s.profesor_sustituto_id = ps.id

      WHERE a.profesor_id = ? AND h.curso_id = ?
    `,
      [fechaFiltro, profesor_id, curso_id]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error horario profesor" });
  }
};

// ➕ CREAR (SOLO ADMIN)
exports.create = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { curso_id, grupo_id, dia, sesion_id, asignacion_id } = req.body;

    if (!curso_id || !grupo_id || !dia || !sesion_id || !asignacion_id) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // 🔍 VALIDAR ASIGNACIÓN EXISTE
    const [[asignacion]] = await pool.query(
      "SELECT * FROM asignaciones WHERE id = ?",
      [asignacion_id],
    );

    if (!asignacion) {
      return res.status(400).json({ error: "Asignación no válida" });
    }

    // 🔴 VALIDAR QUE PERTENECE AL GRUPO Y CURSO
    if (asignacion.grupo_id != grupo_id || asignacion.curso_id != curso_id) {
      return res.status(400).json({
        error: "Asignación no corresponde al grupo/curso",
      });
    }

    // 🔴 CELDA OCUPADA
    const [exist] = await pool.query(
      `
      SELECT id FROM horarios
      WHERE grupo_id = ? AND dia = ? AND sesion_id = ? AND curso_id = ?
    `,
      [grupo_id, dia, sesion_id, curso_id],
    );

    if (exist.length > 0) {
      return res.status(400).json({ error: "Celda ocupada" });
    }

    // 🔴 PROFESOR OCUPADO
    const [conflict] = await pool.query(
      `
      SELECT h.id
      FROM horarios h
      JOIN asignaciones a ON h.asignacion_id = a.id
      WHERE h.dia = ? AND h.sesion_id = ? AND h.curso_id = ?
      AND a.profesor_id = ?
    `,
      [dia, sesion_id, curso_id, asignacion.profesor_id],
    );

    if (conflict.length > 0) {
      return res.status(400).json({
        error: "Profesor ocupado en esa hora",
      });
    }

    const [duplicado] = await pool.query(
      `
  SELECT id FROM horarios
  WHERE grupo_id = ? AND dia = ? AND sesion_id = ? AND asignacion_id = ?
`,
      [grupo_id, dia, sesion_id, asignacion_id],
    );

    if (duplicado.length > 0) {
      return res.status(400).json({
        error: "Esta clase ya está asignada en esa hora",
      });
    }

    await pool.query(
      `
      INSERT INTO horarios (curso_id, grupo_id, dia, sesion_id, asignacion_id)
      VALUES (?, ?, ?, ?, ?)
    `,
      [curso_id, grupo_id, dia, sesion_id, asignacion_id],
    );

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando horario" });
  }
};

// ❌ ELIMINAR (SOLO ADMIN)
exports.remove = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { id } = req.params;

    const [[row]] = await pool.query("SELECT id FROM horarios WHERE id = ?", [
      id,
    ]);

    if (!row) {
      return res.status(404).json({ error: "No encontrado" });
    }

    await pool.query("DELETE FROM horarios WHERE id = ?", [id]);

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error eliminando" });
  }
};

// 🚫 CLASES AFECTADAS
exports.getClasesAfectadas = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ error: "Fecha requerida" });
    }

    const fechaObj = new Date(fecha + "T00:00:00");

    const diasSemana = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sabado",
    ];

    const dia = diasSemana[fechaObj.getDay()].toLowerCase();

    const [rows] = await pool.query(
      `
   SELECT 
    h.id,
    h.dia,
    h.sesion_id,
    h.curso_id,
    h.grupo_id,

    s.nombre AS hora,

    p.nombre AS profesor,
    g.nombre AS grupo,
    asig.nombre AS asignatura,
    asig.color,

    ps.nombre AS sustituto

  FROM horarios h

  JOIN sesiones s ON h.sesion_id = s.id
  JOIN asignaciones a ON h.asignacion_id = a.id
  JOIN profesores p ON a.profesor_id = p.id
  JOIN grupos g ON a.grupo_id = g.id
  JOIN asignaturas asig ON a.asignatura_id = asig.id

  -- 🔥 AQUÍ CAMBIA TODO
  JOIN ausencias au 
    ON au.profesor_id = a.profesor_id AND au.fecha = ?

  JOIN ausencias_detalle ad 
    ON ad.ausencia_id = au.id AND ad.sesion_id = h.sesion_id

  LEFT JOIN sustituciones s2 
    ON s2.horario_id = h.id AND s2.fecha = ?

  LEFT JOIN profesores ps 
    ON s2.profesor_sustituto_id = ps.id

  WHERE LOWER(TRIM(h.dia)) = ?

  ORDER BY h.sesion_id ASC
  `,
      [fecha, fecha, dia],
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error afectadas" });
  }
};

// 👨‍🏫 HORARIO PROFESOR (SEGURO)
exports.getHoyProfesor = async (req, res) => {
  try {
    let profesor_id = req.query.profesor_id;

    if (req.user.rol === "profesor") {
      profesor_id = req.user.profesor_id;
    }

    const { fecha } = req.query;

    // 🔥 VALIDACIÓN
    let fechaObj;

    if (fecha) {
      fechaObj = new Date(fecha);
      if (isNaN(fechaObj)) {
        return res.status(400).json({ error: "Fecha inválida" });
      }
    } else {
      fechaObj = new Date();
    }

    const diasSemana = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sabado",
    ];

    const dia = diasSemana[fechaObj.getDay()];

    const [rows] = await pool.query(
      `
      SELECT 
        h.id,
        h.sesion_id,
        s.nombre as hora,
        g.nombre as grupo,
        asig.nombre as asignatura,
        asig.color
      FROM horarios h
      JOIN sesiones s ON h.sesion_id = s.id
      JOIN asignaciones a ON h.asignacion_id = a.id
      JOIN grupos g ON a.grupo_id = g.id
      JOIN asignaturas asig ON a.asignatura_id = asig.id
      WHERE a.profesor_id = ? AND LOWER(h.dia) = ?
      ORDER BY h.sesion_id ASC
    `,
      [profesor_id, dia],
    );

    res.json(rows);
  } catch (error) {
    console.error("Error horario hoy:", error);
    res.status(500).json({ error: "Error horario hoy" });
  }
};
