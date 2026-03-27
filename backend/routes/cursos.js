const express = require("express");
const router = express.Router();

const controller = require("../controllers/cursosController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, controller.getAll);

module.exports = router;