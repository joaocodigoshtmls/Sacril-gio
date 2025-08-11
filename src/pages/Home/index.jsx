import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({
    alunos: 120,
    ultimoRegistro: 'Hoje às 07:45',
    alertas: 0,
    acessosHoje: 45,
    sistemaAtivo: true
  });

  const [hora, setHora] = useState(new Date());

  // Atualiza hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const metricas = [
    {
      titulo: 'Alunos cadastrados',
      valor: '120',
      tendencia: '+5',
      porcentagem: '+4.3%',
      positiva: true,
      destaque: false
    },
    {
      titulo: 'Reconhecimentos (hoje)',
      valor: '45',
      tendencia: '+12',
      porcentagem: '+36.4%',
      positiva: true,
      destaque: true
    },
    {
      titulo: 'Precisão média',
      valor: '94.8%',
      tendencia: '+0.8%',
      porcentagem: '',
      positiva: true,
      destaque: false
    },
    {
      titulo: 'Alertas ativos',
      valor: '0',
      tendencia: '-2',
      porcentagem: '-100%',
      positiva: true,
      destaque: false
    }
  ];

  const dadosGrafico = [
    { hora: '00', valor: 2 },
    { hora: '03', valor: 1 },
    { hora: '06', valor: 8 },
    { hora: '09', valor: 15 },
    { hora: '12', valor: 12 },
    { hora: '15', valor: 18 },
    { hora: '18', valor: 9 },
    { hora: '21', valor: 4 }
  ];

  const maxValor = Math.max(...dadosGrafico.map(d => d.valor));

  const atividades = [
    { hora: '08:30', evento: 'João Silva reconhecido', status: 'sucesso' },
    { hora: '08:15', evento: 'Ana Costa - entrada registrada', status: 'sucesso' },
    { hora: '08:00', evento: 'Sistema backup executado', status: 'info' },
    { hora: '07:45', evento: 'Pedro Santos reconhecido', status: 'sucesso' },
    { hora: '07:30', evento: 'Câmera 02 - reconexão', status: 'alerta' }
  ];

  const cameras = [
    { nome: 'Portaria', fps: 25, bitrate: '4.6 Mbps', status: 'online' },
    { nome: 'Corredor A', fps: 24, bitrate: '4.2 Mbps', status: 'online' },
    { nome: 'Sala de aula 01', fps: 26, bitrate: '4.6 Mbps', status: 'online' },
    { nome: 'Estacionamento', fps: 23, bitrate: '3.8 Mbps', status: 'offline' }
  ];

  return (
    <div className="space-y-6">
      {/* Header compacto */}
      <div className="backdrop-blur-md bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-xl shadow-slate-900/5 hover:shadow-purple-500/10 hover:border-purple-300/50 dark:hover:border-purple-600/50 transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-slate-800 dark:from-slate-100 dark:via-purple-300 dark:to-slate-100 bg-clip-text text-transparent mb-2">Sistema FaceRec</h1>
            <p className="text-slate-600 dark:text-slate-400">Monitoramento e controle de acesso em tempo real</p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                {hora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              stats.sistemaAtivo 
                ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                : 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${stats.sistemaAtivo ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`}></div>
              Sistema {stats.sistemaAtivo ? 'Ativo' : 'Offline'}
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricas.map((metrica, index) => (
          <div key={index} className={`backdrop-blur-md border rounded-xl p-4 shadow-xl transition-all duration-300 group hover:-translate-y-1 ${
            metrica.destaque 
              ? 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-300/60 dark:border-purple-600/60 shadow-purple-500/20 hover:shadow-purple-500/30' 
              : 'bg-white/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-700/60 shadow-slate-900/5 hover:shadow-slate-900/10 hover:border-purple-300/30 dark:hover:border-purple-600/30'
          }`}>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{metrica.titulo}</div>
            <div className={`text-2xl font-bold mb-2 ${
              metrica.destaque 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent' 
                : 'text-slate-800 dark:text-slate-100'
            }`}>{metrica.valor}</div>
            <div className="flex items-center gap-1 text-xs">
              {metrica.positiva ? (
                <TrendingUp size={12} className={metrica.destaque ? 'text-purple-600' : 'text-emerald-600'} />
              ) : (
                <TrendingDown size={12} className="text-rose-600" />
              )}
              <span className={
                metrica.destaque ? 'text-purple-600' :
                metrica.positiva ? 'text-emerald-600' : 'text-rose-600'
              }>
                {metrica.tendencia}
              </span>
              {metrica.porcentagem && (
                <span className="text-slate-500 dark:text-slate-400">{metrica.porcentagem}</span>
              )}
            </div>
            {metrica.destaque && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            )}
          </div>
        ))}
      </div>

      {/* Gráfico de reconhecimentos por hora */}
      <div className="backdrop-blur-md bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-6 shadow-xl shadow-slate-900/5 hover:shadow-purple-500/10 hover:border-purple-300/30 dark:hover:border-purple-600/30 transition-all duration-500 group">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">Reconhecimentos por hora</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Últimas 24 horas</p>
          </div>
          <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 px-3 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20">
            Atualizar
          </button>
        </div>
        
        <div className="flex items-end justify-between h-32 gap-2">
          {dadosGrafico.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1 group/bar">
              <div 
                className="w-full bg-gradient-to-t from-purple-500 via-indigo-500 to-purple-400 rounded-t-sm transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/50 cursor-pointer group-hover/bar:scale-105"
                style={{ height: `${(item.valor / maxValor) * 100}%`, minHeight: '4px' }}
              ></div>
              <div className="text-xs text-slate-500 dark:text-slate-400 group-hover/bar:text-purple-600 dark:group-hover/bar:text-purple-400 transition-colors duration-300">{item.hora}h</div>
            </div>
          ))}
        </div>
      </div>

      {/* Seções em grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status das câmeras */}
        <div className="backdrop-blur-md bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-6 shadow-xl shadow-slate-900/5 hover:shadow-purple-500/10 hover:border-purple-300/30 dark:hover:border-purple-600/30 transition-all duration-300">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Câmeras</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Status em tempo real</p>
          </div>
          
          <div className="space-y-3">
            {cameras.map((camera, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 dark:hover:from-purple-900/10 dark:hover:to-indigo-900/10 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-rose-400 shadow-lg shadow-rose-400/50'} group-hover:scale-125 transition-transform duration-300`}></div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">{camera.nome}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      FPS: {camera.fps} • {camera.bitrate}
                    </div>
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded transition-all duration-300 ${
                  camera.status === 'online' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/30' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                }`}>
                  {camera.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eventos recentes */}
        <div className="backdrop-blur-md bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-6 shadow-xl shadow-slate-900/5 hover:shadow-purple-500/10 hover:border-purple-300/30 dark:hover:border-purple-600/30 transition-all duration-300">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Eventos recentes</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Últimos 30 min</p>
          </div>
          
          <div className="space-y-3">
            {atividades.map((atividade, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-slate-50/50 dark:hover:from-purple-900/10 dark:hover:to-slate-800/30 transition-all duration-300 group">
                <div className={`w-2 h-2 rounded-full mt-2 transition-all duration-300 group-hover:scale-125 group-hover:shadow-lg ${
                  atividade.status === 'sucesso' ? 'bg-emerald-400 group-hover:shadow-emerald-400/50' :
                  atividade.status === 'info' ? 'bg-purple-400 group-hover:shadow-purple-400/50' : 'bg-amber-400 group-hover:shadow-amber-400/50'
                }`}></div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">{atividade.evento}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{atividade.hora}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status do sistema */}
      <div className="backdrop-blur-md bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-6 shadow-xl shadow-slate-900/5 hover:shadow-purple-500/10 hover:border-purple-300/30 dark:hover:border-purple-600/30 transition-all duration-300 group">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">Criptografia ativa</h3>
            <div className="text-sm text-slate-600 dark:text-slate-400">TLS 1.3 • 256-bit</div>
          </div>
          
          <div className="mt-4 lg:mt-0 flex items-center gap-6">
            <div className="flex items-center gap-2 group/status">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50 group-hover/status:scale-125 transition-transform duration-300"></div>
              <span className="text-sm text-slate-600 dark:text-slate-300 group-hover/status:text-purple-600 dark:group-hover/status:text-purple-400 transition-colors duration-300">API: Funcionando</span>
            </div>
            <div className="flex items-center gap-2 group/status">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50 group-hover/status:scale-125 transition-transform duration-300"></div>
              <span className="text-sm text-slate-600 dark:text-slate-300 group-hover/status:text-purple-600 dark:group-hover/status:text-purple-400 transition-colors duration-300">Database: Conectado</span>
            </div>
            <div className="text-right backdrop-blur-md bg-gradient-to-br from-emerald-500/10 to-purple-500/10 border border-emerald-200/60 dark:border-emerald-700/60 rounded-xl p-4 hover:border-purple-300/60 dark:hover:border-purple-600/60 transition-all duration-300">
              <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">98.5%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;