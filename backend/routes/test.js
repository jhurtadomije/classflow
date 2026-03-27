const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS resultado");
    res.json(rows);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;