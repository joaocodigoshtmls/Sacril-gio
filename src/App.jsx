import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/login';
import Cadastro from './pages/Cadastro';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Configuracoes from './pages/Configuracoes';
import Monitoramento from './pages/Monitoramento';
import MainLayout from './Layout/MainLayout';

// ⬇️ ADICIONE
import Camera from './pages/Camera';

function PrivateRoute({ children }) {
  let usuario = null;

  try {
    const raw = localStorage.getItem("usuario");
    if (raw && raw !== "undefined") {
      usuario = JSON.parse(raw);
    }
  } catch (err) {
    usuario = null;
  }

  return usuario ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const location = useLocation();
  const isPublic = ["/", "/login", "/cadastro"].includes(location.pathname);

  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Privadas */}
      {!isPublic && (
        <>
          <Route path="/home" element={
            <MainLayout>
              <PrivateRoute><Home /></PrivateRoute>
            </MainLayout>
          } />
          <Route path="/dashboard" element={
            <MainLayout>
              <PrivateRoute><Dashboard /></PrivateRoute>
            </MainLayout>
          } />
          <Route path="/monitoramento" element={
            <MainLayout>
              <PrivateRoute><Monitoramento /></PrivateRoute>
            </MainLayout>
          } />
          <Route path="/configuracoes" element={
            <MainLayout>
              <PrivateRoute><Configuracoes /></PrivateRoute>
            </MainLayout>
          } />

          {/* ⬇️ NOVA ROTA PRIVADA */}
          <Route path="/camera" element={
            <MainLayout>
              <PrivateRoute><Camera /></PrivateRoute>
            </MainLayout>
          } />
        </>
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
