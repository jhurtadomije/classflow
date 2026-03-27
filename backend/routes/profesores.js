const express = require("express");
const router = express.Router();

const controller = require("../controllers/profesoresController");
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken);

// CRUD profesores
router.get("/", controller.getAll);
router.post("/", controller.create);
router.delete("/:id", controller.remove);

// 🔥 NUEVO → asignaturas del profesor
router.get("/:id/asignaturas", controller.getAsignaturas);
router.put("/:id/asignaturas", controller.updateAsignaturas);

module.exports = router;