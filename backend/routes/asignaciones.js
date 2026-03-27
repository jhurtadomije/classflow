const express = require("express");
const router = express.Router();

const controller = require("../controllers/asignacionesController");
const { verifyToken } = require("../middleware/auth");

// 🔐 TODAS PROTEGIDAS
router.get("/", verifyToken, controller.getAll);
router.post("/", verifyToken, controller.create);
router.delete("/:id", verifyToken, controller.remove);

module.exports = router;