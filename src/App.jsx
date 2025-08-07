import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';

import Login from './pages/login'; // Letra minúscula, como está na pasta
import Cadastro from './pages/Cadastro';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Configuracoes from './pages/Configuracoes';
import Monitoramento from './pages/Monitoramento';
import MainLayout from './Layout/MainLayout';

// ✅ Rota privada protegida com JSON seguro
function PrivateRoute({ children }) {
  let usuario = null;

  try {
    const raw = localStorage.getItem("usuario");

    // Garante que o valor seja válido antes de fazer parse
    if (raw && raw !== "undefined") {
      usuario = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Erro ao interpretar localStorage:", err);
    usuario = null;
  }

  return usuario ? children : <Navigate to="/login" />;
}

// ✅ Todas as rotas organizadas corretamente
function AppRoutes() {
  const location = useLocation();
  const isPublic = ["/", "/login", "/cadastro"].includes(location.pathname);

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Rotas privadas com layout */}
      {!isPublic && (
        <>
          <Route
            path="/home"
            element={
              <MainLayout>
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              </MainLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              </MainLayout>
            }
          />
          <Route
            path="/monitoramento"
            element={
              <MainLayout>
                <PrivateRoute>
                  <Monitoramento />
                </PrivateRoute>
              </MainLayout>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <MainLayout>
                <PrivateRoute>
                  <Configuracoes />
                </PrivateRoute>
              </MainLayout>
            }
          />
        </>
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
