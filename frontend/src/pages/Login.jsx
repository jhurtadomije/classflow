import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setToken(res.data.token);

      navigate("/");

    } catch (err) {
      setError(
        err?.response?.data?.error || "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fade-up d-flex align-items-center justify-content-center px-3"
      style={{ minHeight: "100vh", background: "#f5f7fb" }}
    >
      {/* 🔥 CARD RESPONSIVE */}
      <div
        className="card shadow border-0 p-5 w-100 mx-auto"
        style={{ maxWidth: "520px" }}
      >
        {/* 🔥 LOGO */}
        <div className="text-center mb-3">
          <img
            src="/classFlow_Logo.png"
            alt="ClassFlow"
            style={{
              maxWidth: "180px",
              height: "auto",
            }}
          />
        </div>

        {/* 🔥 ESLOGAN */}
        <div className="text-center mb-4 text-muted small">
          El control total de tu horario escolar
        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger py-2">{error}</div>
        )}

        <input
          className="form-control mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-4"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
        />

        <button
          className="btn btn-primary w-100"
          onClick={login}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {/* FOOTER */}
        <div className="text-center mt-3 small text-muted">
          © {new Date().getFullYear()} ClassFlow
        </div>
      </div>
    </div>
  );
}