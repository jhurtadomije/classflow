const express = require("express");
const router = express.Router();

const controller = require("../controllers/sustitucionesController");
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken);

router.get("/sugerencias", controller.getSugerencias);
router.post("/", controller.create);

module.exports = router;