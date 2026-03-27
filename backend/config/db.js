
/*const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

module.exports = pool;*/

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,

  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
(async () => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() as db");
    console.log("🟢 CONECTADO A BD:", rows[0].db);
  } catch (err) {
    console.error("❌ ERROR CONEXIÓN BD:", err.message);
  }
})();