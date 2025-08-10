import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { LayoutDashboard, Home, Monitor, Settings, LogOut, Bell, Search, Camera, Moon, Sun, Shield } from 'lucide-react';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [dark, setDark] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario({
          nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
          photoURL: user.photoURL || ''
        });
      } else {
        setUsuario(null);
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const html = document.documentElement;
    if (dark) html.classList.add('dark');
    else html.classList.remove('dark');
  }, [dark]);

  const signOutUser = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const menu = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/monitoramento', label: 'Monitoramento', icon: Monitor },
    { to: '/configuracoes', label: 'Configurações', icon: Settings },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed z-40 inset-y-0 left-0 w-72 backdrop-blur-md bg-white/60 dark:bg-slate-900/40 border-r border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-900/5 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="h-20 flex items-center gap-3 px-5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 grid place-items-center text-white shadow-lg shadow-indigo-500/30">
              <Camera size={22} />
            </div>
            <div>
              <p className="font-semibold tracking-tight">FaceRec • CFTV</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">segurança em tempo real</p>
            </div>
          </div>

          <nav className="px-3 mt-2 space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${active ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60'}`}
                >
                  <Icon className={`shrink-0 ${active ? 'opacity-100' : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-4 inset-x-3">
            <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 grid place-items-center text-white">
                  <Shield size={18} />
                </div>
                <div className="text-xs">
                  <p className="font-semibold leading-4">Criptografia ativa</p>
                  <p className="text-slate-500 dark:text-slate-400 leading-4">TLS 1.3 • 256-bit</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 lg:ml-72">
          {/* Topbar */}
          <header className="sticky top-0 z-30 backdrop-blur-md bg-white/60 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="h-16 px-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition">
                  <span className="i-lucide-menu h-5 w-5 block" />
                </button>
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60">
                  <Search size={16} className="text-slate-500" />
                  <input placeholder="Buscar câmeras, eventos..." className="bg-transparent outline-none text-sm w-64 placeholder:text-slate-500" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setDark(!dark)} className="p-2 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition">
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button className="relative p-2 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition">
                  <Bell size={18} />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] grid place-items-center text-white">3</span>
                </button>
                {usuario && (
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs leading-4 text-slate-500 dark:text-slate-400">Autenticado</p>
                      <p className="text-sm font-medium leading-4">{usuario?.nome}</p>
                    </div>
                    <img src={usuario.photoURL || '/vite.svg'} alt="avatar" className="h-9 w-9 rounded-xl ring-2 ring-slate-200/80 dark:ring-slate-800/80" />
                    <button onClick={signOutUser} className="px-3 py-2 rounded-xl bg-rose-600 text-white text-sm hover:brightness-110 active:translate-y-px transition flex items-center gap-2">
                      <LogOut size={16} /> Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
