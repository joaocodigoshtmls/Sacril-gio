import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [periodo, setPeriodo] = useState('7dias');
  const [dados, setDados] = useState({
    reconhecimentosHoje: 156,
    precisao: 94.8,
    tempoMedioResposta: 0.3,
    tentativasNegadas: 12
  });

  // Dados para gráfico de reconhecimentos por hora (simulado)
  const reconhecimentosPorHora = [
    { hora: '6h', quantidade: 5 },
    { hora: '7h', quantidade: 23 },
    { hora: '8h', quantidade: 45 },
    { hora: '9h', quantidade: 34 },
    { hora: '10h', quantidade: 28 },
    { hora: '11h', quantidade: 31 },
    { hora: '12h', quantidade: 18 },
    { hora: '13h', quantidade: 25 },
    { hora: '14h', quantidade: 39 },
    { hora: '15h', quantidade: 42 },
    { hora: '16h', quantidade: 38 },
    { hora: '17h', quantidade: 29 },
  ];

  // Top 5 usuários mais ativos
  const usuariosAtivos = [
    { nome: "João Silva", acessos: 42, curso: "Eng. Mecânica", avatar: "JS" },
    { nome: "Maria Santos", acessos: 38, curso: "Ciência Comp.", avatar: "MS" },
    { nome: "Pedro Lima", acessos: 35, curso: "Eng. Elétrica", avatar: "PL" },
    { nome: "Ana Costa", acessos: 31, curso: "Sistemas Info.", avatar: "AC" },
    { nome: "Carlos Dias", acessos: 28, curso: "Design Digital", avatar: "CD" }
  ];

  // Logs de sistema em tempo real (simulação)
  const [logsRecentes, setLogsRecentes] = useState([
    { id: 1, timestamp: "09:23:45", evento: "Reconhecimento bem-sucedido", usuario: "João Silva", status: "sucesso" },
    { id: 2, timestamp: "09:22:31", evento: "Tentativa de acesso negada", usuario: "Desconhecido", status: "erro" },
    { id: 3, timestamp: "09:21:18", evento: "Sistema de backup iniciado", usuario: "Sistema", status: "info" },
    { id: 4, timestamp: "09:20:02", evento: "Reconhecimento bem-sucedido", usuario: "Maria Santos", status: "sucesso" }
  ]);

  // Simulação de atualização dos logs em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const novosEventos = [
        "Reconhecimento bem-sucedido",
        "Tentativa de acesso negada", 
        "Calibração de câmera",
        "Backup automático"
      ];
      const usuarios = ["João Silva", "Maria Santos", "Pedro Lima", "Sistema", "Desconhecido"];
      
      const novoLog = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        evento: novosEventos[Math.floor(Math.random() * novosEventos.length)],
        usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
        status: Math.random() > 0.8 ? "erro" : Math.random() > 0.5 ? "info" : "sucesso"
      };

      setLogsRecentes(prev => [novoLog, ...prev.slice(0, 9)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const maxReconhecimentos = Math.max(...reconhecimentosPorHora.map(item => item.quantidade));

  return (
    <div className="space-y-8">
      {/* Header com filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Analítico</h1>
          <p className="text-gray-600">Monitore o desempenho do sistema FaceRec em tempo real</p>
        </div>

        <div className="mt-4 lg:mt-0 flex space-x-2">
          {['24h', '7dias', '30dias'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                periodo === p
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {p === '24h' ? 'Últimas 24h' : p === '7dias' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{dados.reconhecimentosHoje}</div>
              <div className="text-blue-100 text-sm">reconhecimentos</div>
            </div>
          </div>
          <div className="text-blue-100">Hoje</div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div className="bg-white rounded-full h-2" style={{width: '68%'}}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{dados.precisao}%</div>
              <div className="text-green-100 text-sm">precisão</div>
            </div>
          </div>
          <div className="text-green-100">Taxa de acerto</div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div className="bg-white rounded-full h-2" style={{width: '94.8%'}}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{dados.tempoMedioResposta}s</div>
              <div className="text-orange-100 text-sm">tempo médio</div>
            </div>
          </div>
          <div className="text-orange-100">Resposta do sistema</div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div className="bg-white rounded-full h-2" style={{width: '85%'}}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🚫</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{dados.tentativasNegadas}</div>
              <div className="text-red-100 text-sm">tentativas negadas</div>
            </div>
          </div>
          <div className="text-red-100">Hoje</div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div className="bg-white rounded-full h-2" style={{width: '23%'}}></div>
          </div>
        </div>
      </div>

      {/* Gráfico e Top Usuários */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Gráfico de reconhecimentos por hora */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Reconhecimentos por Hora</h2>
            <div className="text-sm text-gray-500">Hoje</div>
          </div>
          
          <div className="h-80">
            <div className="flex items-end justify-between h-64 mb-4">
              {reconhecimentosPorHora.map((item, index) => (
                <div key={index} className="flex flex-col items-center group">
                  <div 
                    className="w-8 bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-lg hover:from-purple-500 hover:to-blue-400 transition-all duration-300 cursor-pointer relative group-hover:scale-110"
                    style={{
                      height: `${(item.quantidade / maxReconhecimentos) * 240}px`,
                      minHeight: '8px'
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.quantidade}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{item.hora}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 border-t pt-2">
              <span>Menor atividade: 6h-7h</span>
              <span>Pico: 15h-16h</span>
            </div>
          </div>
        </div>

        {/* Top 5 usuários mais ativos */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Top Usuários</h2>
          
          <div className="space-y-4">
            {usuariosAtivos.map((usuario, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {usuario.avatar}
                  </div>
                  <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{usuario.nome}</div>
                  <div className="text-gray-500 text-sm">{usuario.curso}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-purple-600">{usuario.acessos}</div>
                  <div className="text-gray-400 text-xs">acessos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logs em tempo real */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Logs do Sistema</h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Atualizando em tempo real</span>
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {logsRecentes.map((log) => (
            <div key={log.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border-l-4 border-l-gray-200">
              <div className={`w-2 h-2 rounded-full ${
                log.status === 'sucesso' ? 'bg-green-400' : 
                log.status === 'erro' ? 'bg-red-400' : 'bg-blue-400'
              }`}></div>
              
              <div className="text-gray-500 text-sm font-mono w-20">{log.timestamp}</div>
              
              <div className="flex-1">
                <div className="font-medium text-gray-800">{log.evento}</div>
                <div className="text-gray-500 text-sm">Usuário: {log.usuario}</div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                log.status === 'sucesso' ? 'bg-green-100 text-green-700' :
                log.status === 'erro' ? 'bg-red-100 text-red-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                {log.status === 'sucesso' ? 'Sucesso' : 
                 log.status === 'erro' ? 'Erro' : 'Info'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Análise de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Performance do Sistema</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">CPU</span>
                <span className="font-semibold">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full" style={{width: '23%'}}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Memória</span>
                <span className="font-semibold">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full" style={{width: '67%'}}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Armazenamento</span>
                <span className="font-semibold">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full" style={{width: '42%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Estatísticas Rápidas</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">1.247</div>
              <div className="text-gray-600 text-sm">Total reconhecimentos</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">98.2%</div>
              <div className="text-gray-600 text-sm">Uptime mensal</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">340</div>
              <div className="text-gray-600 text-sm">Usuários únicos</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">0.28s</div>
              <div className="text-gray-600 text-sm">Tempo médio</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}