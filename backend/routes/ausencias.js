const express = require("express");
const router = express.Router();

const controller = require("../controllers/ausenciasController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, controller.getByFecha);
router.post("/", verifyToken, controller.create);
router.delete("/:id", verifyToken, controller.remove);

module.exports = router;