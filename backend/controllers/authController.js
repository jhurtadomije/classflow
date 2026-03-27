// controllers/authController.js
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔐 desde .env
const SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // 🔴 VALIDACIÓN BÁSICA
    if (!email || !password) {
      return res.status(400).json({ error: "Credenciales requeridas" });
    }

    email = email.toLowerCase().trim();

    // 🔍 BUSCAR USUARIO
    const [[user]] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    // 🔐 MISMO MENSAJE SI FALLA (NO FILTRAR INFO)
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 🔍 COMPROBAR PASSWORD
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 🔥 TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        rol: user.rol,
        profesor_id: user.profesor_id,
      },
      SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
        profesor_id: user.profesor_id,
      },
    });

  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ error: "Error interno" });
  }
};