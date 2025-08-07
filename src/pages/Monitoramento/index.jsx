import React, { useState, useEffect } from 'react';

const Monitoramento = () => {
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [reconhecimentoAtivo, setReconhecimentoAtivo] = useState(true);
  const [qualidadeVideo, setQualidadeVideo] = useState('HD');
  const [detectados, setDetectados] = useState([]);
  const [volumeStorage, setVolumeStorage] = useState(67);

  // Estados para controles de câmera
  const [configuracoes, setConfiguracoes] = useState({
    brilho: 50,
    contraste: 50,
    saturacao: 50,
    zoom: 100
  });

  // Simulação de pessoas detectadas
  const pessoasDetectadas = [
    { id: 1, nome: "João Silva", confianca: 96.8, timestamp: "14:23:45", status: "Autorizado" },
    { id: 2, nome: "Maria Santos", confianca: 94.2, timestamp: "14:22:18", status: "Autorizado" },
    { id: 3, nome: "Pessoa Desconhecida", confianca: 67.5, timestamp: "14:21:52", status: "Negado" },
    { id: 4, nome: "Pedro Lima", confianca: 98.1, timestamp: "14:20:33", status: "Autorizado" }
  ];

  // Arquivos de gravação simulados
  const arquivosGravacao = [
    { id: 1, nome: "recording_2024_08_07_14_20.mp4", tamanho: "245 MB", duracao: "00:15:32", data: "07/08/2024" },
    { id: 2, nome: "recording_2024_08_07_13_45.mp4", tamanho: "189 MB", duracao: "00:12:14", data: "07/08/2024" },
    { id: 3, nome: "recording_2024_08_07_12_30.mp4", tamanho: "298 MB", duracao: "00:18:45", data: "07/08/2024" }
  ];

  // Simulação de atualização de detecções em tempo real
  useEffect(() => {
    if (cameraAtiva && reconhecimentoAtivo) {
      const interval = setInterval(() => {
        const novaDeteccao = {
          id: Date.now(),
          nome: Math.random() > 0.7 ? "Pessoa Desconhecida" : pessoasDetectadas[Math.floor(Math.random() * pessoasDetectadas.length)].nome,
          confianca: (Math.random() * 40 + 60).toFixed(1),
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          status: Math.random() > 0.3 ? "Autorizado" : "Negado"
        };
        
        setDetectados(prev => [novaDeteccao, ...prev.slice(0, 4)]);
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [cameraAtiva, reconhecimentoAtivo]);

  const handleConfigChange = (config, value) => {
    setConfiguracoes(prev => ({
      ...prev,
      [config]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header com controles principais */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🎥 Monitoramento ao Vivo</h1>
            <p className="text-slate-300">Controle total da câmera e sistema de reconhecimento facial</p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            {/* Status da câmera */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              cameraAtiva ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              <div className={`w-3 h-3 rounded-full ${cameraAtiva ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-sm font-medium">{cameraAtiva ? 'ONLINE' : 'OFFLINE'}</span>
            </div>

            {/* Toggle câmera */}
            <button
              onClick={() => setCameraAtiva(!cameraAtiva)}
              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                cameraAtiva 
                  ? 'bg-red-600 hover:bg-red-700 text-black' 
                  : 'bg-green-600 hover:bg-green-700 text-black'
              }`}
            >
              {cameraAtiva ? '⏹️ Desligar' : '▶️ Ligar'} Câmera
            </button>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Área principal da câmera */}
        <div className="xl:col-span-3 space-y-6">
          {/* Visualizador da câmera */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Feed da Câmera</h2>
              <div className="flex items-center space-x-4">
                <select 
                  value={qualidadeVideo}
                  onChange={(e) => setQualidadeVideo(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="4K">4K (2160p)</option>
                  <option value="FHD">Full HD (1080p)</option>
                  <option value="HD">HD (720p)</option>
                  <option value="SD">SD (480p)</option>
                </select>

                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  gravando ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {gravando ? '🔴 Gravando' : '⭕ Não gravando'}
                </div>
              </div>
            </div>

            {/* Container do vídeo */}
            <div className={`relative w-full h-96 rounded-xl overflow-hidden ${
              cameraAtiva ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
              {cameraAtiva ? (
                <div className="w-full h-full flex items-center justify-center text-black relative">
                  {/* Simulação da camera - substitua pela integração real */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-90"></div>
                  
                  {/* Overlay de reconhecimento facial */}
                  {reconhecimentoAtivo && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-blue-600/80 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="text-sm font-medium">🎯 Reconhecimento Ativo</div>
                        <div className="text-xs text-blue-200">Precisão: 94.8%</div>
                      </div>
                    </div>
                  )}

                  {/* Simulação de detecção */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 border-4 border-green-400 rounded-lg mb-4 animate-pulse"></div>
                      <div className="text-green-400 font-semibold">Feed da Câmera Ativo</div>
                      <div className="text-gray-300 text-sm">Aguardando detecção facial...</div>
                    </div>
                  </div>

                  {/* Controles de overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex justify-between items-center text-sm">
                        <div>Qualidade: {qualidadeVideo}</div>
                        <div>FPS: 30</div>
                        <div>Zoom: {configuracoes.zoom}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <div className="text-6xl mb-4">📷</div>
                  <div className="text-xl font-semibold mb-2">Câmera Desligada</div>
                  <div className="text-sm">Clique em "Ligar Câmera" para iniciar o monitoramento</div>
                </div>
              )}
            </div>
          </div>

          {/* Controles de gravação */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Controles de Gravação</h3>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setGravando(!gravando)}
                disabled={!cameraAtiva}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  gravando
                    ? 'bg-red-600 hover:bg-red-700 text-black'
                    : 'bg-blue-600 hover:bg-blue-700 text-black disabled:bg-gray-400'
                }`}
              >
                <span>{gravando ? '⏹️' : '⏺️'}</span>
                <span>{gravando ? 'Parar' : 'Iniciar'} Gravação</span>
              </button>

              <button className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-black rounded-xl font-semibold transition-all duration-300">
                <span>📸</span>
                <span>Capturar Foto</span>
              </button>

              <button className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-black rounded-xl font-semibold transition-all duration-300">
                <span>📁</span>
                <span>Arquivos</span>
              </button>

              <button
                onClick={() => setReconhecimentoAtivo(!reconhecimentoAtivo)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  reconhecimentoAtivo
                    ? 'bg-orange-600 hover:bg-orange-700 text-black'
                    : 'bg-gray-600 hover:bg-gray-700 text-black'
                }`}
              >
                <span>{reconhecimentoAtivo ? '🎯' : '❌'}</span>
                <span>{reconhecimentoAtivo ? 'Pausar' : 'Ativar'} Reconhecimento</span>
              </button>
            </div>
          </div>
        </div>

        {/* Painel lateral */}
        <div className="space-y-6">
          {/* Detecções recentes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Detecções Recentes</h3>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(detectados.length > 0 ? detectados : pessoasDetectadas).slice(0, 4).map((pessoa, index) => (
                <div key={pessoa.id || index} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${
                    pessoa.status === 'Autorizado' ? 'bg-green-400' : 'bg-red-400'
                  } animate-pulse`}></div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm">{pessoa.nome}</div>
                    <div className="text-gray-500 text-xs">{pessoa.timestamp}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-semibold text-purple-600">{pessoa.confianca}%</div>
                    <div className={`text-xs ${
                      pessoa.status === 'Autorizado' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {pessoa.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configurações da câmera */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ajustes da Câmera</h3>
            
            <div className="space-y-4">
              {Object.entries(configuracoes).map(([config, value]) => (
                <div key={config}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 capitalize">{config}</span>
                    <span className="text-sm text-gray-800">{value}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => handleConfigChange(config, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    disabled={!cameraAtiva}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Status do sistema */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Status do Sistema</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Storage Usado</span>
                <span className="font-semibold">{volumeStorage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${volumeStorage}%`}}
                ></div>
              </div>

              <div className="pt-4 space-y-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Temperatura CPU</span>
                  <span className="text-green-600 font-medium">42°C</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Conexão</span>
                  <span className="text-green-600 font-medium">Estável</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Última verificação</span>
                  <span className="text-gray-500">Há 2 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arquivos de gravação */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Arquivos de Gravação</h2>
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1 transition-colors">
            <span>Gerenciar arquivos</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {arquivosGravacao.map((arquivo) => (
            <div key={arquivo.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-purple-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600">🎬</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{arquivo.nome}</div>
                    <div className="text-gray-500 text-xs">{arquivo.data}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{arquivo.duracao}</span>
                <span>{arquivo.tamanho}</span>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors">
                  ▶️ Reproduzir
                </button>
                <button className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors">
                  💾 Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default Monitoramento;