const express = require("express");
const router = express.Router();

const controller = require("../controllers/sesionesController");
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken);

router.get("/", controller.getAll);
router.post("/", controller.create);
router.delete("/:id", controller.remove);

module.exports = router;