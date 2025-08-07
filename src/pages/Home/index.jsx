import React, { useState, useEffect } from 'react';

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

  const cards = [
    {
      titulo: 'Alunos Cadastrados',
      valor: stats.alunos,
      icone: '👨‍🎓',
      cor: 'from-blue-500 to-cyan-500',
      bgCard: 'bg-blue-50',
      detalhes: 'Total no sistema',
      trend: '+5 este mês'
    },
    {
      titulo: 'Último Registro',
      valor: stats.ultimoRegistro,
      icone: '📷',
      cor: 'from-green-500 to-emerald-500', 
      bgCard: 'bg-green-50',
      detalhes: 'Reconhecimento facial',
      trend: 'Ativo'
    },
    {
      titulo: 'Alertas',
      valor: stats.alertas > 0 ? stats.alertas : 'Nenhum',
      icone: '⚠️',
      cor: stats.alertas > 0 ? 'from-red-500 to-pink-500' : 'from-gray-400 to-gray-500',
      bgCard: stats.alertas > 0 ? 'bg-red-50' : 'bg-gray-50',
      detalhes: 'Sistema seguro',
      trend: stats.alertas > 0 ? 'Requer atenção' : 'Tudo normal'
    },
    {
      titulo: 'Acessos Hoje',
      valor: stats.acessosHoje,
      icone: '🚪',
      cor: 'from-purple-500 to-pink-500',
      bgCard: 'bg-purple-50',
      detalhes: 'Entradas registradas',
      trend: '+12% vs ontem'
    }
  ];

  const atividades = [
    { hora: '08:30', evento: 'João Silva fez login', tipo: 'sucesso' },
    { hora: '08:15', evento: 'Sistema de backup executado', tipo: 'info' },
    { hora: '08:00', evento: 'Ana Costa reconhecida', tipo: 'sucesso' },
    { hora: '07:45', evento: 'Pedro Santos fez login', tipo: 'sucesso' },
    { hora: '07:30', evento: 'Manutenção programada concluída', tipo: 'info' }
  ];

  return (
    <div className="space-y-8">
      {/* Header com boas-vindas */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white p-8">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Bem-vindo ao FaceRec! 👋
              </h1>
              <p className="text-xl text-blue-100 mb-6 lg:mb-0">
                Gerencie facilmente os acessos e monitore seu sistema de reconhecimento facial
              </p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center min-w-[200px]">
              <div className="text-3xl font-bold">
                {hora.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-blue-100 text-sm">
                {hora.toLocaleDateString('pt-BR', { 
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long'
                })}
              </div>
              <div className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs ${
                stats.sistemaAtivo 
                  ? 'bg-green-500/20 text-green-100' 
                  : 'bg-red-500/20 text-red-100'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  stats.sistemaAtivo ? 'bg-green-400' : 'bg-red-400'
                } animate-pulse`}></div>
                {stats.sistemaAtivo ? 'Sistema Ativo' : 'Sistema Offline'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className={`${card.bgCard} border border-gray-200 rounded-2xl p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${card.cor} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {card.icone}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                card.trend.includes('+') || card.trend === 'Ativo' 
                  ? 'bg-green-100 text-green-700' 
                  : card.trend.includes('atenção')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {card.trend}
              </div>
            </div>
            
            <h3 className="text-gray-600 text-sm font-medium mb-2">{card.titulo}</h3>
            <div className="text-3xl font-bold text-gray-800 mb-1">{card.valor}</div>
            <p className="text-gray-500 text-sm">{card.detalhes}</p>
          </div>
        ))}
      </div>

      {/* Seção de atividades recentes e ações rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Atividades recentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Atividade Recente</h2>
            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1 transition-colors">
              <span>Ver todas</span>
              <span>→</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {atividades.map((atividade, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-3 h-3 rounded-full ${
                  atividade.tipo === 'sucesso' 
                    ? 'bg-green-400' 
                    : atividade.tipo === 'info'
                    ? 'bg-blue-400'
                    : 'bg-red-400'
                }`}></div>
                
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{atividade.evento}</p>
                  <p className="text-gray-500 text-sm">{atividade.hora}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Ações Rápidas</h2>
          
          <div className="space-y-4">
            <button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                👨‍🎓
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Cadastrar Aluno</div>
                <div className="text-gray-500 text-sm">Adicionar novo usuário</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                📊
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Ver Relatórios</div>
                <div className="text-gray-500 text-sm">Análises detalhadas</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                ⚙️
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Configurações</div>
                <div className="text-gray-500 text-sm">Ajustar sistema</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 hover:from-orange-100 hover:to-red-100 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                🔒
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Segurança</div>
                <div className="text-gray-500 text-sm">Logs e auditoria</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Status do sistema (barra inferior) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Status do Sistema</h3>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Reconhecimento Facial: Ativo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Database: Conectado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600">API: Funcionando</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <div className="text-gray-500 text-sm">Uptime do sistema</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;