exports.isAdmin = (req, res, next) => {
  if (req.user.rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  next();
};

exports.isProfesor = (req, res, next) => {
  if (req.user.rol !== "profesor") {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  next();
};