// components/layout/Navbar.jsx
import { useNavigate } from "react-router-dom";

export default function Navbar({ setOpen, setToken, isMobile }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    navigate("/login", { replace: true });
  };

  return (
    <div
      className="d-flex justify-content-between align-items-center px-3"
      style={{
        height: "64px",
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 997,
      }}
    >
      <div className="d-flex align-items-center gap-2">
        {isMobile && (
          <button
            className="btn btn-light"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
        )}

        <div>
          <h5 className="m-0 fw-semibold">ClassFlow</h5>
          <div className="small text-muted">Panel de gestión</div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 gap-md-3">
        <div
          className="d-flex align-items-center gap-2 px-2 py-1 rounded"
          style={{ background: "#f1f5f9" }}
        >
          <span>👤</span>
          <span className="fw-medium">{user?.nombre || "Usuario"}</span>
        </div>

        <button className="btn btn-sm btn-outline-danger" onClick={logout}>
          Salir
        </button>
      </div>
    </div>
  );
}