import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Ajuste o caminho conforme necessário
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Monitora autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario({
          nome: user.displayName || 'Usuário',
          email: user.email,
          foto: user.photoURL
        });
      } else {
        // Se não estiver logado, verifica localStorage
        const usuarioLocal = localStorage.getItem('usuario');
        if (usuarioLocal) {
          setUsuario(JSON.parse(usuarioLocal));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('usuario');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const menuItems = [
    { path: '/home', icon: '🏠', label: 'Home', gradient: 'from-blue-500 to-cyan-500' },
    { path: '/dashboard', icon: '📊', label: 'Dashboard', gradient: 'from-purple-500 to-pink-500' },
    { path: '/monitoramento', icon: '📋', label: 'Monitoramento', gradient: 'from-green-500 to-emerald-500' },
    { path: '/configuracoes', icon: '⚙️', label: 'Configurações', gradient: 'from-orange-500 to-red-500' }
  ];

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 
        transition-transform duration-300 ease-in-out shadow-2xl
      `}>

        <div className="relative h-full flex flex-col">
          {/* Header da Sidebar */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              {/* Logo sem imagem */}
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-2xl font-bold text-white">FaceRec</h1>
                  <p className="text-xs text-purple-200">Sistema Inteligente</p>
                </div>
              </div>

              {/* Botão fechar (mobile) */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white/60 hover:text-white transition-colors p-2"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navegação */}
          <nav className="flex-1 p-6 space-y-3">
            <p className="text-xs uppercase tracking-wider text-purple-200 font-semibold mb-4">
              Navegação
            </p>
            
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300
                  ${isActiveRoute(item.path) 
                    ? 'bg-white/20 text-white shadow-lg transform scale-105' 
                    : 'text-purple-100 hover:bg-white/10 hover:text-white hover:transform hover:scale-105'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-300
                  ${isActiveRoute(item.path) 
                    ? `bg-gradient-to-r ${item.gradient} shadow-lg` 
                    : 'bg-white/10 group-hover:bg-white/20'
                  }
                `}>
                  {item.icon}
                </div>
                
                <div className="flex-1">
                  <span className="font-semibold text-sm">{item.label}</span>
                  {isActiveRoute(item.path) && (
                    <div className="w-full h-0.5 bg-gradient-to-r from-white to-transparent mt-1 rounded-full" />
                  )}
                </div>

                {isActiveRoute(item.path) && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            ))}
          </nav>

          {/* Área do usuário com cor de fundo */}
          <div className="p-6 border-t border-white/10">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 group shadow-lg"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/30">
                  {usuario?.foto ? (
                    <img src={usuario.foto} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    usuario?.nome?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                
                <div className="flex-1 text-left">
                  <p className="text-white font-bold text-base">
                    {usuario?.nome || 'Usuário'}
                  </p>
                  <p className="text-blue-100 text-sm">
                    {usuario?.email || 'usuario@email.com'}
                  </p>
                </div>

                <div className="text-white/80 group-hover:text-white transition-colors">
                  {showUserMenu ? '▲' : '▼'}
                </div>
              </button>

              {/* Menu dropdown do usuário */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-2">
                  <Link
                    to="/configuracoes"
                    onClick={() => {
                      setShowUserMenu(false);
                      setSidebarOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">👤</span>
                    <span className="font-medium">Minha Conta</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="text-lg">🚪</span>
                    <span className="font-medium">Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header Mobile */}
        <header className="lg:hidden bg-white shadow-sm border-b p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-gray-800">FaceRec</h1>
          </div>

          <div className="w-10" /> {/* Spacer para centralizar o logo */}
        </header>

        {/* Área de Conteúdo */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb/Header da página */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <span>FaceRec</span>
                <span>/</span>
                <span className="text-gray-800 font-medium capitalize">
                  {location.pathname.replace('/', '') || 'Home'}
                </span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button (opcional) */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-30">
        <span className="text-2xl">💬</span>
      </button>
    </div>
  );
}