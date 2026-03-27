// components/layout/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ open, setOpen, isMobile }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const linkStyle = (path) => ({
    display: "block",
    padding: "10px 12px",
    borderRadius: "10px",
    marginBottom: "6px",
    background: location.pathname === path ? "#334155" : "transparent",
    color: "#fff",
    textDecoration: "none",
    transition: "all 0.2s ease",
    fontWeight: location.pathname === path ? 600 : 400,
  });

  return (
    <aside
      style={{
        width: "220px",
        background: "#1e293b",
        color: "#fff",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: isMobile ? (open ? "0" : "-220px") : "0",
        padding: "20px",
        zIndex: 999,
        transition: "left 0.3s ease",
        boxShadow: isMobile && open ? "0 0 20px rgba(0,0,0,0.15)" : "none",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          {/* 🔥 LOGO */}
          <div className="text-center mb-4">
            <img
              src="/classFlow_Logo.png"
              alt="ClassFlow"
              style={{
                maxWidth: "140px",
                height: "auto",
              }}
            />
          </div>
        </div>

        {isMobile && (
          <button
            className="btn btn-sm btn-light"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        )}
      </div>

      <nav>
        <Link
          to="/"
          style={linkStyle("/")}
          onClick={() => isMobile && setOpen(false)}
        >
          📊 Inicio
        </Link>

        <Link
          to="/horarios"
          style={linkStyle("/horarios")}
          onClick={() => isMobile && setOpen(false)}
        >
          📅 Horarios
        </Link>

        {user?.rol === "admin" && (
          <>
            <Link
              to="/profesores"
              style={linkStyle("/profesores")}
              onClick={() => isMobile && setOpen(false)}
            >
              👨‍🏫 Profesores
            </Link>

            <Link
              to="/ausencias"
              style={linkStyle("/ausencias")}
              onClick={() => isMobile && setOpen(false)}
            >
              ⛔ Ausencias
            </Link>

            <Link
              to="/asignaturas"
              style={linkStyle("/asignaturas")}
              onClick={() => isMobile && setOpen(false)}
            >
               📚 Asignaturas
            </Link>

            <Link
              to="/asignaciones"
              style={linkStyle("/asignaciones")}
              onClick={() => isMobile && setOpen(false)}
            >
              🔗 Asignaciones
            </Link>

            <Link
              to="/grupos"
              style={linkStyle("/grupos")}
              onClick={() => isMobile && setOpen(false)}
            >
              👥 Grupos
            </Link>
          </>
        )}
      </nav>

      <div
        className="mt-4 p-3 rounded"
        style={{
          background: "#334155",
          fontSize: "14px",
        }}
      >
        <div className="small text-light opacity-75">Sesión iniciada como</div>
        <strong>{user?.nombre || "Usuario"}</strong>
        <div className="small mt-1 text-light opacity-75">
          {user?.rol === "admin" ? "Administrador" : "Profesor"}
        </div>
      </div>
    </aside>
  );
}
