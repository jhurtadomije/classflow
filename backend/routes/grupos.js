const express = require("express");
const router = express.Router();

const controller = require("../controllers/gruposController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, controller.getAll);
router.post("/", verifyToken, controller.create);
router.put("/:id", verifyToken, controller.update);
router.delete("/:id", verifyToken, controller.remove);


module.exports = router;