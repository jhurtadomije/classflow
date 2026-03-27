// backend/app.js
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ClassFlow API funcionando 🚀");
});
const testRoutes = require("./routes/test");
app.use("/test", testRoutes);

const profesoresRoutes = require("./routes/profesores");
app.use("/profesores", profesoresRoutes);

const asignaturasRoutes = require("./routes/asignaturas");
app.use("/asignaturas", asignaturasRoutes);

const gruposRoutes = require("./routes/grupos");
app.use("/grupos", gruposRoutes);

const sesionesRoutes = require("./routes/sesiones");
app.use("/sesiones", sesionesRoutes);

const asignacionesRoutes = require("./routes/asignaciones");
app.use("/asignaciones", asignacionesRoutes);

const horariosRoutes = require("./routes/horarios");
app.use("/horarios", horariosRoutes);

const cursosRoutes = require("./routes/cursos");
app.use("/cursos", cursosRoutes);

const ausenciasRoutes = require("./routes/ausencias");
app.use("/ausencias", ausenciasRoutes);

const sustitucionesRoutes = require("./routes/sustituciones");
app.use("/sustituciones", sustitucionesRoutes);

const dashboardRoutes = require("./routes/dashboard");
app.use("/dashboard", dashboardRoutes);

app.use("/auth", require("./routes/auth"));



module.exports = app;