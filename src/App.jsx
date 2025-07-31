import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import Login from './pages/login';
import Cadastro from './pages/Cadastro';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard/index'; // <- Nova Dashboard
import MainLayout from './layout/MainLayout';
import Configuracoes from './pages/Configuracoes';
import Monitoramento from './pages/Monitoramento'; // <- Antigo Alunos

function AppContent() {
  const location = useLocation();
  const isPublicPage = ["/", "/cadastro", "/login"].includes(location.pathname);

  return (
    <div className="flex min-h-screen">
      {!isPublicPage && <MainLayout />}
      <div className="flex-1 bg-gray-50">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} /> {/* Novo Dashboard */}
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/monitoramento" element={<Monitoramento />} /> {/* Novo Monitoramento */}
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
