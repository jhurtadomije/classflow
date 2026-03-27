import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Horarios from "./pages/Horarios";
import Profesores from "./pages/Profesores";
import Ausencias from "./pages/Ausencias";
import ProfesorPanel from "./pages/ProfesorPanel";
import Asignaturas from "./pages/Asignaturas";
import Asignaciones from "./pages/Asignaciones";
import Cursos from "./pages/Cursos";
import Grupos from "./pages/Grupos";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            !token ? <Login setToken={setToken} /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/*"
          element={
            token ? (
              <Layout setToken={setToken}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      user?.rol === "profesor" ? (
                        <ProfesorPanel />
                      ) : (
                        <Dashboard />
                      )
                    }
                  />
                  <Route path="/horarios" element={<Horarios />} />
                  <Route
                    path="/profesores"
                    element={
                      user?.rol === "admin" ? (
                        <Profesores />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                  <Route
                    path="/ausencias"
                    element={
                      user?.rol === "admin" ? (
                        <Ausencias />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                  <Route path="/profesores/:id" element={<ProfesorPanel />} />
                  <Route
                    path="/asignaturas"
                    element={
                      user?.rol === "admin" ? (
                        <Asignaturas />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                  <Route
                    path="/asignaciones"
                    element={
                      user?.rol === "admin" ? (
                        <Asignaciones />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />

                  <Route
                    path="/grupos"
                    element={
                      user?.rol === "admin" ? (
                        <Grupos />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />

                  <Route
                    path="/cursos"
                    element={
                      user?.rol === "admin" ? (
                        <Cursos />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
