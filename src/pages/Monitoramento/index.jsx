import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Power,
  CircleStop,
  CirclePlay,
  Download,
  FileVideo,
  Gauge,
  Activity,
  AlertTriangle,
  Volume2,
  Settings2,
  Zap,
  Pause,
  Play,
  Focus,
  ShieldCheck,
  ShieldX,
  Cpu,
  HardDrive,
  Network,
  Thermometer,
  Timer,
  ScanFace,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Tooltip as ReTooltip,
} from "recharts";

export default function Monitoramento() {
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [reconhecimentoAtivo, setReconhecimentoAtivo] = useState(true);
  const [qualidadeVideo, setQualidadeVideo] = useState("HD");
  const [detectados, setDetectados] = useState([]);
  const [volumeStorage, setVolumeStorage] = useState(67);
  const [muted, setMuted] = useState(true);

  const [configuracoes, setConfiguracoes] = useState({
    brilho: 50,
    contraste: 50,
    saturacao: 50,
    zoom: 100,
  });

  const pessoasDetectadas = [
    { id: 1, nome: "João Silva", confianca: 96.8, timestamp: "14:23:45", status: "Autorizado" },
    { id: 2, nome: "Maria Santos", confianca: 94.2, timestamp: "14:22:18", status: "Autorizado" },
    { id: 3, nome: "Pessoa Desconhecida", confianca: 67.5, timestamp: "14:21:52", status: "Negado" },
    { id: 4, nome: "Pedro Lima", confianca: 98.1, timestamp: "14:20:33", status: "Autorizado" },
  ];

  const arquivosGravacao = [
    { id: 1, nome: "recording_2024_08_07_14_20.mp4", tamanho: "245 MB", duracao: "00:15:32", data: "07/08/2024" },
    { id: 2, nome: "recording_2024_08_07_13_45.mp4", tamanho: "189 MB", duracao: "00:12:14", data: "07/08/2024" },
    { id: 3, nome: "recording_2024_08_07_12_30.mp4", tamanho: "298 MB", duracao: "00:18:45", data: "07/08/2024" },
  ];

  useEffect(() => {
    if (cameraAtiva && reconhecimentoAtivo) {
      const interval = setInterval(() => {
        const exemplo = pessoasDetectadas[Math.floor(Math.random() * pessoasDetectadas.length)];
        const novaDeteccao = {
          id: Date.now(),
          nome: Math.random() > 0.7 ? "Pessoa Desconhecida" : exemplo.nome,
          confianca: Number((Math.random() * 40 + 60).toFixed(1)),
          timestamp: new Date().toLocaleTimeString("pt-BR"),
          status: Math.random() > 0.3 ? "Autorizado" : "Negado",
        };
        setDetectados((prev) => [novaDeteccao, ...prev].slice(0, 10));
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [cameraAtiva, reconhecimentoAtivo]);

  const serieTempo = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        t: `${String(i).padStart(2, "0")}:00`,
        fps: 24 + Math.round(Math.sin(i / 2.8) * 6) + (cameraAtiva ? 4 : 0),
      })),
    [cameraAtiva]
  );

  const storageData = useMemo(
    () => [
      { name: "Uso", value: volumeStorage },
      { name: "Livre", value: 100 - volumeStorage },
    ],
    [volumeStorage]
  );

  const handleConfigChange = (config, value) => {
    setConfiguracoes((prev) => ({ ...prev, [config]: value }));
  };

  const Stat = ({ icon: Icon, label, value, accent = "violet" }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
      <div className={`size-10 rounded-xl grid place-items-center bg-${accent}-50 text-${accent}-600`}>
        <Icon className="size-5" />
      </div>
      <div>
        <div className="text-slate-500 text-xs">{label}</div>
        <div className="text-slate-900 text-xl font-semibold">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.6)]"
      >
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl grid place-items-center bg-white/10">
              <Camera className="size-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-tight">Monitoramento ao Vivo</h1>
              <p className="text-slate-300">Controle da câmera e reconhecimento facial em tempo real</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                cameraAtiva
                  ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                  : "border-rose-400/60 bg-rose-400/10 text-rose-300"
              }`}
            >
              <span
                className={`size-2.5 rounded-full ${
                  cameraAtiva ? "bg-emerald-400" : "bg-rose-400"
                } animate-pulse`}
              />
              <span className="text-xs tracking-wide font-medium">
                {cameraAtiva ? "ONLINE" : "OFFLINE"}
              </span>
            </div>

            <button
              onClick={() => setCameraAtiva((v) => !v)}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition-all border focus:outline-none focus:ring-2 focus:ring-white/30 ${
                cameraAtiva
                  ? "bg-rose-500 hover:bg-rose-600 text-black border-rose-400"
                  : "bg-emerald-500 hover:bg-emerald-600 text-black border-emerald-400"
              }`}
            >
              {cameraAtiva ? <CircleStop className="size-4" /> : <CirclePlay className="size-4" />}
              {cameraAtiva ? "Desligar" : "Ligar"} Câmera
            </button>

            <button
              onClick={() => setGravando((v) => !v)}
              disabled={!cameraAtiva}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium border transition-all ${
                gravando
                  ? "bg-rose-600 border-rose-500 text-black hover:bg-rose-700"
                  : "bg-white/10 border-white/20 text-black hover:bg-white/15 disabled:opacity-50"
              }`}
            >
              {gravando ? <Pause className="size-4" /> : <Play className="size-4" />}
              {gravando ? "Parar" : "Gravar"}
            </button>

            <button
              onClick={() => setMuted((m) => !m)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl font-medium bg-white/10 border border-white/20 text-black hover:bg-white/15"
            >
              <Volume2 className="size-4" />
              {muted ? "Mudo" : "Som"}
            </button>
          </div>
        </div>

        {/* KPIs topo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <Stat
            icon={Activity}
            label="FPS médio"
            value={`${Math.round(serieTempo.reduce((a, b) => a + b.fps, 0) / serieTempo.length)} fps`}
          />
          <Stat icon={ShieldCheck} label="Precisão" value="94.8%" />
          <Stat icon={Timer} label="Latência" value="0.28 s" />
          <Stat icon={AlertTriangle} label="Alertas (30m)" value="12" />
        </div>
      </motion.div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* COLUNA PRINCIPAL */}
        <div className="xl:col-span-3 space-y-6">
          {/* FEED DA CÂMERA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Focus className="size-4 text-violet-600" />
                <h2 className="text-lg font-semibold text-slate-800">Feed da Câmera</h2>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={qualidadeVideo}
                  onChange={(e) => setQualidadeVideo(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  <option value="4K">4K (2160p)</option>
                  <option value="FHD">Full HD (1080p)</option>
                  <option value="HD">HD (720p)</option>
                  <option value="SD">SD (480p)</option>
                </select>
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    gravando
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {gravando ? "🔴 Gravando" : "⭕ Inativo"}
                </div>
              </div>
            </div>

            {/* CANVAS DO VIDEO */}
            <div className={`relative w-full h-96 ${cameraAtiva ? "bg-slate-950" : "bg-slate-100"}`}>
              {cameraAtiva ? (
                <>
                  {/* Grid e vinheta sutil */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(transparent_31px,rgba(255,255,255,0.08)_32px),linear-gradient(90deg,transparent_31px,rgba(255,255,255,0.08)_32px)] bg-[size:32px_32px]" />

                  {/* Caixa de detecção fake */}
                  {reconhecimentoAtivo && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 150, damping: 14 }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="w-40 h-40 border-2 border-emerald-400/90 rounded-lg shadow-[0_0_40px_-10px_rgba(16,185,129,0.9)]" />
                    </motion.div>
                  )}

                  {/* HUD */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-violet-600/80 text-white px-3 py-2 rounded-lg backdrop-blur-sm text-xs shadow-lg">
                      🎯 Reconhecimento {reconhecimentoAtivo ? "Ativo" : "Pausado"}
                    </div>
                    <div className="bg-black/50 text-white px-3 py-2 rounded-lg backdrop-blur-sm text-xs shadow-lg">
                      Qualidade: {qualidadeVideo}
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 text-white rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex justify-between items-center text-xs">
                        <div>FPS: {serieTempo[serieTempo.length - 1].fps}</div>
                        <div>Zoom: {configuracoes.zoom}%</div>
                        <div>Brilho: {configuracoes.brilho}%</div>
                        <div>Contraste: {configuracoes.contraste}%</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full grid place-items-center text-slate-400">
                  <div className="text-center">
                    <Camera className="size-12 mx-auto mb-3" />
                    <div className="text-lg font-medium">Câmera desligada</div>
                    <div className="text-sm">Clique em "Ligar Câmera" para iniciar o monitoramento</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* CONTROLES DE GRAVAÇÃO E AJUSTES RÁPIDOS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <FileVideo className="size-4 text-violet-600" /> Controles de Gravação
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setGravando((v) => !v)}
                  disabled={!cameraAtiva}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all border ${
                    gravando
                      ? "bg-rose-600 border-rose-600 text-white hover:bg-rose-700"
                      : "bg-slate-900 text-white border-slate-900 hover:bg-black disabled:opacity-40"
                  }`}
                >
                  {gravando ? <CircleStop className="size-4" /> : <CirclePlay className="size-4" />}
                  {gravando ? "Parar" : "Gravar"}
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border bg-white hover:bg-slate-50">
                  <Camera className="size-4" /> Capturar Foto
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border bg-white hover:bg-slate-50">
                  <HardDrive className="size-4" /> Arquivos
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Settings2 className="size-4 text-violet-600" /> Ajustes Rápidos
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(configuracoes).map(([config, value]) => (
                  <div key={config}>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-slate-500 capitalize">{config}</span>
                      <span className="text-xs text-slate-700">{value}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => handleConfigChange(config, parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={!cameraAtiva}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mini gráfico FPS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Activity className="size-4 text-violet-600" /> FPS (últimas 24h)
              </h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={serieTempo} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradFps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                    <XAxis dataKey="t" hide />
                    <YAxis hide />
                    <ReTooltip />
                    <Area type="monotone" dataKey="fps" stroke="#7c3aed" strokeWidth={2} fill="url(#gradFps)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ARQUIVOS DE GRAVAÇÃO */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Arquivos de Gravação</h2>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1">
                Gerenciar arquivos <span>→</span>
              </button>
            </div>

            {/* Grid auto-fit: nunca ultrapassa a largura */}
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {arquivosGravacao.map((arquivo) => (
                <div
                  key={arquivo.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all hover:border-purple-300 bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-700">🎬</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm truncate max-w-[18rem]">
                          {arquivo.nome}
                        </div>
                        <div className="text-gray-500 text-xs">{arquivo.data}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{arquivo.duracao}</span>
                    <span>{arquivo.tamanho}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-xs font-medium">
                      ▶️ Reproduzir
                    </button>
                    <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-lg text-xs font-medium">
                      💾 Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PAINEL LATERAL */}
        <div className="space-y-6">
          {/* DETECÇÕES RECENTES */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <ScanFace className="size-4 text-violet-600" /> Detecções Recentes
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {(detectados.length > 0 ? detectados : pessoasDetectadas)
                .slice(0, 8)
                .map((pessoa) => (
                  <div
                    key={pessoa.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={`size-2.5 rounded-full ${
                        pessoa.status === "Autorizado" ? "bg-emerald-500" : "bg-rose-500"
                      } animate-pulse`}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-800 text-sm">{pessoa.nome}</div>
                      <div className="text-slate-500 text-xs">{pessoa.timestamp}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-violet-600">{pessoa.confianca}%</div>
                      <div
                        className={`text-xs ${
                          pessoa.status === "Autorizado" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {pessoa.status}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* STATUS DO SISTEMA */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <HardDrive className="size-4 text-violet-600" /> Status do Sistema
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-slate-600">Storage usado</span>
                  <span className="font-semibold">{volumeStorage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-violet-600 h-2 rounded-full"
                    style={{ width: `${volumeStorage}%` }}
                  />
                </div>
              </div>

              {/* Medidor radial simples */}
              <div className="col-span-1">
                <div className="text-xs text-slate-500 mb-2">Uso de CPU</div>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={[{ name: "CPU", value: 42 }]}
                      startAngle={180}
                      endAngle={0}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar background dataKey="value" cornerRadius={6} fill="#8b5cf6" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-1">
                <div className="text-xs text-slate-500 mb-2">Uso de Rede</div>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={[{ name: "NET", value: 68 }]}
                      startAngle={180}
                      endAngle={0}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar background dataKey="value" cornerRadius={6} fill="#22d3ee" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Temperatura CPU</span>
                  <span className="text-emerald-600 font-medium">42°C</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Conexão</span>
                  <span className="text-emerald-600 font-medium">Estável</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Última verificação</span>
                  <span className="text-slate-500">Há 2 min</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Reconhecimento</span>
                  <span className={`${reconhecimentoAtivo ? "text-emerald-600" : "text-rose-600"} font-medium`}>
                    {reconhecimentoAtivo ? "Ativo" : "Pausado"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
}
