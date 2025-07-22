import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import MainLayout from './layout/MainLayout';
import Configuracoes from './pages/Configuracoes';

function AppContent() {
  const location = useLocation();
  const isPublicPage = ["/", "/cadastro"].includes(location.pathname);

  return (
    <div className="flex min-h-screen">
      {!isPublicPage && <MainLayout />}
      <div className="flex-1 bg-gray-50">
        <Routes>
          {/* Rota raiz agora carrega o Login */}
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          {/* opcional: catch‑all */}
          <Route path="*" element={<div>404 – Página não encontrada</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
