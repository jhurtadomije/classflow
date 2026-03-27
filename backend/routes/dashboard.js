const express = require("express");
const router = express.Router();

const controller = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/auth");

router.get("/detalle", verifyToken, controller.getDetalle);

module.exports = router;