// routes/horarios.js
const express = require("express");
const router = express.Router();

const controller = require("../controllers/horariosController");
const { verifyToken } = require("../middleware/auth");

// 🔐 TODAS LAS RUTAS REQUIEREN LOGIN
router.use(verifyToken);

// 📄 CONSULTAS (permitidas a todos autenticados)
router.get("/", controller.getByGrupo);
router.get("/profesor", controller.getByProfesor);
router.get("/afectadas", controller.getClasesAfectadas);
router.get("/hoy", controller.getHoyProfesor);

// ✏️ MODIFICACIÓN (controlada en controller por rol)
router.post("/", controller.create);
router.delete("/:id", controller.remove);

module.exports = router;