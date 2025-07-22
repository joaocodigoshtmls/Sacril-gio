import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import MainLayout from './layout/MainLayout';
import Configuracoes from './pages/Configuracoes';


function AppContent() {
  const location = useLocation();
  const isPublicPage = ["/", "/login", "/cadastro"].includes(location.pathname);


  return (
    <div className="flex min-h-screen">
      {!isPublicPage && <MainLayout />}
      <div className="flex-1 bg-gray-50">
        <Routes>
          <Route path="/Login" element={<Login />} /> {/* <- essa linha define a rota raiz */}
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          

        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
