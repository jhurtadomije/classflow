// controllers/profesoresController.js
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// 🔍 Obtener todos
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        p.apellidos,
        p.activo,

        u.email AS usuario_email,
        u.rol,

        a.id AS asignatura_id,
        a.nombre AS asignatura_nombre,
        a.color AS asignatura_color

      FROM profesores p

      LEFT JOIN usuarios u 
        ON u.profesor_id = p.id

      LEFT JOIN profesor_asignaturas pa 
        ON pa.profesor_id = p.id

      LEFT JOIN asignaturas a 
        ON a.id = pa.asignatura_id AND a.activa = 1

      WHERE p.activo = 1

      ORDER BY p.id DESC
    `);

    // 🔥 AGRUPAR
    const profesoresMap = {};

    for (const row of rows) {
      if (!profesoresMap[row.id]) {
        profesoresMap[row.id] = {
          id: row.id,
          nombre: row.nombre,
          apellidos: row.apellidos,
          activo: row.activo,
          usuario_email: row.usuario_email,
          rol: row.rol,
          asignaturas: []
        };
      }

      if (row.asignatura_id) {
        profesoresMap[row.id].asignaturas.push({
          id: row.asignatura_id,
          nombre: row.asignatura_nombre,
          color: row.asignatura_color
        });
      }
    }

    res.json(Object.values(profesoresMap));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo profesores" });
  }
};

// ➕ Crear profesor
exports.create = async (req, res) => {
  try {
    // 🔐 SOLO ADMIN
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const {
      nombre,
      apellidos,
      email,
      crear_usuario,
      password,
      rol
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "Nombre requerido" });
    }

    // 🔴 VALIDAR EMAIL SI SE USA
    if (crear_usuario) {
      if (!email || !password) {
        return res.status(400).json({
          error: "Email y contraseña requeridos"
        });
      }

      const [existUser] = await pool.query(
        "SELECT id FROM usuarios WHERE email = ?",
        [email]
      );

      if (existUser.length > 0) {
        return res.status(400).json({ error: "Email ya en uso" });
      }
    }

    // 1️⃣ Crear profesor
    const [result] = await pool.query(
      `INSERT INTO profesores (nombre, apellidos, email, activo)
       VALUES (?, ?, ?, 1)`,
      [nombre, apellidos || null, email || null]
    );

    const profesor_id = result.insertId;

    // 2️⃣ Crear usuario
    if (crear_usuario) {
      const hash = await bcrypt.hash(password, 10);

      await pool.query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol, profesor_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          nombre,
          email.toLowerCase(),
          hash,
          rol === "admin" ? "admin" : "profesor", // 🔐 sanitizar rol
          profesor_id
        ]
      );
    }

    res.json({ ok: true, id: profesor_id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando profesor" });
  }
};

// ❌ Eliminar (SOFT + VALIDACIÓN)
exports.remove = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { id } = req.params;

    // 🔍 EXISTE?
    const [[prof]] = await pool.query(
      "SELECT id FROM profesores WHERE id = ?",
      [id]
    );

    if (!prof) {
      return res.status(404).json({ error: "No encontrado" });
    }

    // 🔴 EN USO?
    const [uso] = await pool.query(`
      SELECT id FROM asignaciones WHERE profesor_id = ? LIMIT 1
    `, [id]);

    if (uso.length > 0) {
      return res.status(400).json({
        error: "No se puede eliminar, profesor en uso"
      });
    }

    // 🔥 BORRAR USUARIO
    await pool.query(
      "DELETE FROM usuarios WHERE profesor_id = ?",
      [id]
    );

    // 🔥 SOFT DELETE PROFESOR
    await pool.query(
      "UPDATE profesores SET activo = 0 WHERE id = ?",
      [id]
    );

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error eliminando profesor" });
  }
};

exports.getAsignaturas = async (req, res) => {
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

exports.updateAsignaturas = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { id } = req.params;
    const { asignaturas } = req.body;

    if (!Array.isArray(asignaturas)) {
      return res.status(400).json({ error: "Formato inválido" });
    }

    // comprobar profesor
    const [[profesor]] = await conn.query(
      "SELECT id FROM profesores WHERE id = ?",
      [id]
    );

    if (!profesor) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

    await conn.beginTransaction();

    // borrar relaciones actuales
    await conn.query(
      "DELETE FROM profesor_asignaturas WHERE profesor_id = ?",
      [id]
    );

    // insertar nuevas
    for (const asignaturaId of asignaturas) {
      await conn.query(
        "INSERT INTO profesor_asignaturas (profesor_id, asignatura_id) VALUES (?, ?)",
        [id, asignaturaId]
      );
    }

    await conn.commit();

    res.json({ ok: true });

  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Error actualizando asignaturas" });

  } finally {
    conn.release();
  }
};