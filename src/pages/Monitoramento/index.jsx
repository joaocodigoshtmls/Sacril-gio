import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera, CircleStop, CirclePlay, FileVideo, Activity, AlertTriangle, Volume2,
  Settings2, Pause, Play, Focus, ShieldCheck, HardDrive, Timer, ScanFace,
  Download, Trash2, Pencil, Save, Cpu, Network
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis, Tooltip as ReTooltip
} from "recharts";
import Hls from "hls.js";

const CAM_BASE = import.meta.env.VITE_CAM_BASE || "http://localhost:3000";

/** Presets: mantive as câmeras HLS (áudio) e adicionei ESP32 (MJPEG) via backend */
const PRESETS = [
  { id: "esp32", label: "ESP32 (via backend)", type: "mjpeg", url: `${CAM_BASE}/api/cam/stream` },
  { id: "aje", label: "Mundo • Al Jazeera English (áudio)", type: "hls", url: "https://live-hls-apps-aje-v3-fa.getaj.net/AJE/index.m3u8" },
  { id: "dw-en", label: "Mundo • DW English (áudio)", type: "hls", url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8" },
  { id: "cna", label: "Ásia • CNA – Channel NewsAsia (áudio)", type: "hls", url: "https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index.m3u8" },
];

/* ===== IndexedDB helpers para gravações ===== */
const DB_NAME = "monitor-rec-db";
const DB_STORE = "recs";
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbAll() {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const req = tx.objectStore(DB_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
async function idbPut(item) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.objectStore(DB_STORE).put(item);
  });
}
async function idbDelete(id) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.objectStore(DB_STORE).delete(id);
  });
}

export default function Monitoramento() {
  // ===== estados principais
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [reconhecimentoAtivo, setReconhecimentoAtivo] = useState(true);
  const [qualidadeVideo, setQualidadeVideo] = useState("Auto");
  const [detectados, setDetectados] = useState([]);
  const [volumeStorage, setVolumeStorage] = useState(67);
  const [muted, setMuted] = useState(true);
  const [usarProxy, setUsarProxy] = useState(true);
  const [statusMsg, setStatusMsg] = useState("Câmera desligada");

  const [configuracoes, setConfiguracoes] = useState({
    brilho: 50, contraste: 50, saturacao: 50, zoom: 100,
  });

  // ===== player refs
  const videoRef = useRef(null);  // HLS
  const imgRef = useRef(null);    // ESP32 MJPEG
  const hlsRef = useRef(null);
  const canvasSnapRef = useRef(null);

  // ===== gravação
  const recRef = useRef(null);            // MediaRecorder
  const recStreamRef = useRef(null);      // MediaStream do vídeo/canvas
  const recChunksRef = useRef([]);        // chunks
  const recCanvasRef = useRef(null);      // canvas para ESP32
  const drawTimerRef = useRef(null);      // loop desenhar MJPEG no canvas
  const [recordings, setRecordings] = useState([]);
  const [renamingId, setRenamingId] = useState(null);
  const [renameDraft, setRenameDraft] = useState("");

  // ===== presets
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const currentPreset = useMemo(
    () => PRESETS.find(p => p.id === presetId) || PRESETS[0],
    [presetId]
  );
  const isESP32 = currentPreset.type === "mjpeg";

  // ===== simulação de detecções (mantida)
  const pessoasDetectadas = [
    { id: 1, nome: "João Silva", confianca: 96.8, timestamp: "14:23:45", status: "Autorizado" },
    { id: 2, nome: "Maria Santos", confianca: 94.2, timestamp: "14:22:18", status: "Autorizado" },
    { id: 3, nome: "Pessoa Desconhecida", confianca: 67.5, timestamp: "14:21:52", status: "Negado" },
    { id: 4, nome: "Pedro Lima", confianca: 98.1, timestamp: "14:20:33", status: "Autorizado" },
  ];

  useEffect(() => {
    idbAll().then(items => setRecordings(items.sort((a,b)=>b.createdAt-a.createdAt))).catch(()=>{});
  }, []);

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

  // ===== liga/desliga feed mantendo tudo antigo + ESP32
  useEffect(() => {
    if (!cameraAtiva) {
      stopAll();
      setStatusMsg("Câmera desligada");
      setGravando(false);
      return;
    }
    isESP32 ? startESP32() : startHLS(currentPreset.url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraAtiva, presetId, usarProxy]);

  // ===== mute no <video> e no stream da gravação
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.volume = muted ? 0 : 1;
      if (!muted) videoRef.current.play().catch(()=>{});
    }
    if (recStreamRef.current) {
      recStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !muted; });
    }
  }, [muted]);

  function buildPlayableUrl(raw) {
    if (!usarProxy) return raw;
    return `${CAM_BASE}/proxy/hls?src=${encodeURIComponent(raw)}`;
  }

  function startHLS(src) {
    setStatusMsg("Conectando…");
    const video = videoRef.current;
    stopHLS();

    const url = buildPlayableUrl(src);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        maxBufferLength: 20,
        fragLoadingTimeOut: 25000,
        manifestLoadingTimeOut: 25000,
      });
      hlsRef.current = hls;
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(url);
      });
      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        setStatusMsg(`Online • ${data.levels?.length || 1} perfis`);
        video.play().catch(()=>{});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          setStatusMsg("Falha no HLS, tentando reconectar…");
          try { hls.destroy(); } catch {}
          hlsRef.current = null;
          setTimeout(() => startHLS(src), 2000);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", () => video.play().catch(()=>{}), { once: true });
      setStatusMsg("Online (nativo)");
    } else {
      setStatusMsg("Seu navegador não suporta HLS.js");
    }
  }

  function startESP32() {
    setStatusMsg("Conectando (ESP32)...");
    if (imgRef.current) {
      // cache-buster
      imgRef.current.src = `${currentPreset.url}${currentPreset.url.includes("?") ? "&" : "?"}t=${Date.now()}`;
      setStatusMsg("Online (ESP32/MJPEG)");
    }
  }

  function stopHLS() {
    const video = videoRef.current;
    if (hlsRef.current) {
      try { hlsRef.current.destroy(); } catch {}
      hlsRef.current = null;
    }
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }

  function stopAll() {
    stopHLS();
    if (imgRef.current) imgRef.current.src = "";
    stopGravacao();
  }

  // ===== filtros (mantido)
  function cssFilter() {
    const { brilho, contraste, saturacao } = configuracoes;
    const b = (brilho / 50) * 100;
    const c = (contraste / 50) * 100;
    const s = (saturacao / 50) * 100;
    return `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
  }
  const handleConfigChange = (config, value) => {
    setConfiguracoes((prev) => ({ ...prev, [config]: value }));
  };

  // ===== captura de foto (mantida, com fallback ao backend)
  async function capturarFoto() {
    const canvas = canvasSnapRef.current || document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.filter = cssFilter();

    if (isESP32 && imgRef.current?.naturalWidth) {
      canvas.width = imgRef.current.naturalWidth;
      canvas.height = imgRef.current.naturalHeight;
      ctx.drawImage(imgRef.current, 0, 0);
    } else if (!isESP32 && videoRef.current?.videoWidth) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
    } else {
      // fallback: usa o snapshot do backend
      const r = await fetch(`${CAM_BASE}/api/cam/capture?t=${Date.now()}`);
      const blob = await r.blob();
      const bmp = await createImageBitmap(blob);
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      ctx.drawImage(bmp, 0, 0);
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `snapshot_${new Date().toISOString().replaceAll(":", "-")}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png", 0.92);
  }

  // ===== gravação (mantida) + modo ESP32 via canvas
  function suporteMediaRecorder() { return typeof MediaRecorder !== "undefined"; }

  function toggleGravar() {
    if (!suporteMediaRecorder()) return alert("MediaRecorder não é suportado neste navegador.");
    if (!cameraAtiva) return alert("Ligue a câmera antes de gravar.");
    gravando ? stopGravacao() : (isESP32 ? startRecCanvas() : startRecVideo());
  }

  // HLS: captura direto do <video> (mantido)
  function startRecVideo() {
    const v = videoRef.current;
    const stream = v.captureStream?.(30) || v.mozCaptureStream?.();
    if (!stream) return alert("Não foi possível capturar o stream do vídeo.");
    stream.getAudioTracks().forEach(t => { t.enabled = !muted; });
    recStreamRef.current = stream;
    iniciarRecorder(stream);
  }

  // ESP32: desenha MJPEG no canvas e grava canvas.captureStream()
  function startRecCanvas() {
    const canvas = recCanvasRef.current || document.createElement("canvas");
    recCanvasRef.current = canvas;
    const ctx = canvas.getContext("2d");

    const w = imgRef.current?.naturalWidth || 1280;
    const h = imgRef.current?.naturalHeight || 720;
    canvas.width = w; canvas.height = h;

    const draw = () => {
      if (!cameraAtiva || !isESP32) return;
      if (!imgRef.current) return;
      ctx.filter = cssFilter();
      ctx.drawImage(imgRef.current, 0, 0, w, h);
    };
    drawTimerRef.current = setInterval(draw, 33); // ~30fps

    const stream = canvas.captureStream(30);
    recStreamRef.current = stream; // sem áudio (mjpeg não traz áudio)
    iniciarRecorder(stream);
  }

  function iniciarRecorder(stream) {
    recChunksRef.current = [];
    const mime = ["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].find(t => MediaRecorder.isTypeSupported?.(t));
    let mr;
    try {
      mr = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 4_000_000 } : undefined);
    } catch {
      return alert("MediaRecorder não pôde iniciar.");
    }
    recRef.current = mr;

    mr.ondataavailable = (ev) => { if (ev.data && ev.data.size > 0) recChunksRef.current.push(ev.data); };
    mr.onstop = async () => {
      const blob = new Blob(recChunksRef.current, { type: mr.mimeType || "video/webm" });
      stream.getTracks().forEach(t => t.stop());
      if (drawTimerRef.current) { clearInterval(drawTimerRef.current); drawTimerRef.current = null; }
      recStreamRef.current = null;

      const id = `rec_${Date.now()}`;
      const createdAt = Date.now();
      const name = `gravacao_${new Date(createdAt).toISOString().replaceAll(":", "-").slice(0, 19)}.webm`;
      const size = blob.size;
      const item = { id, name, createdAt, size, blob };
      setRecordings(prev => [item, ...prev]);
      try { await idbPut(item); } catch {}
      recChunksRef.current = [];
    };

    mr.start(1000);
    setGravando(true);
  }

  function stopGravacao() {
    if (recRef.current && recRef.current.state !== "inactive") {
      try { recRef.current.stop(); } catch {}
    }
    recRef.current = null;
    if (drawTimerRef.current) { clearInterval(drawTimerRef.current); drawTimerRef.current = null; }
    setGravando(false);
  }

  // ===== helpers UI gravações (mantidos)
  function fmtSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    const units = ["B","KB","MB","GB"];
    let i = 0, v = bytes;
    while (v >= 1024 && i < units.length-1) { v /= 1024; i++; }
    return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
  }
  function baixar(item) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(item.blob);
    a.href = url;
    a.download = item.name || "gravacao.webm";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function excluir(item) {
    await idbDelete(item.id).catch(()=>{});
    setRecordings(prev => prev.filter(r => r.id !== item.id));
  }
  function startRenomear(item) {
    setRenamingId(item.id);
    setRenameDraft(item.name || "");
  }
  async function salvarRenome(item) {
    const novo = { ...item, name: renameDraft.trim() || item.name };
    await idbPut(novo).catch(()=>{});
    setRecordings(prev => prev.map(r => r.id === item.id ? novo : r));
    setRenamingId(null);
    setRenameDraft("");
  }

  // ===== séries e estatísticas (mantidas)
  const serieTempo = useMemo(
    () => Array.from({ length: 24 }).map((_, i) => ({
      t: `${String(i).padStart(2, "0")}:00`,
      fps: 24 + Math.round(Math.sin(i / 2.8) * 6) + (cameraAtiva ? 4 : 0),
    })), [cameraAtiva]
  );

  const Stat = ({ icon: Icon, label, value }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
      <div className="size-10 rounded-xl grid place-items-center bg-violet-50 text-violet-600">
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
      {/* HEADER (mantido) */}
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
              <p className="text-slate-300">ESP32 (MJPEG) + Câmeras HLS (áudio), com gravação, captura e filtros</p>
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
              <span className={`size-2.5 rounded-full ${cameraAtiva ? "bg-emerald-400" : "bg-rose-400"} animate-pulse`} />
              <span className="text-xs tracking-wide font-medium">{statusMsg}</span>
            </div>

            <button
              onClick={() => setCameraAtiva(v => !v)}
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
              onClick={toggleGravar}
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
              onClick={() => setMuted(m => !m)}
              disabled={isESP32} /* ESP32 MJPEG não traz áudio */
              title={isESP32 ? "ESP32 MJPEG não entrega áudio" : "Alternar som"}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl font-medium bg-white/10 border border-white/20 text-black hover:bg-white/15 disabled:opacity-50"
            >
              <Volume2 className="size-4" />
              {muted ? "Mudo" : "Som"}
            </button>
          </div>
        </div>

        {/* KPIs topo (mantido) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <Stat icon={Activity} label="FPS médio"
            value={`${Math.round(serieTempo.reduce((a, b) => a + b.fps, 0) / serieTempo.length)} fps`} />
          <Stat icon={ShieldCheck} label="Precisão" value="94.8%" />
          <Stat icon={Timer} label="Latência" value={isESP32 ? "~0.2–0.5 s" : "~1–3 s"} />
          <Stat icon={AlertTriangle} label="Alertas (30m)" value="12" />
        </div>
      </motion.div>

      {/* GRID PRINCIPAL (mantido) */}
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
                  value={presetId}
                  onChange={(e) => setPresetId(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  {PRESETS.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>

                {!isESP32 && (
                  <label className="text-xs flex items-center gap-2">
                    <input type="checkbox" checked={usarProxy} onChange={e => setUsarProxy(e.target.checked)} />
                    Usar proxy (recomendado)
                  </label>
                )}

                <select
                  value={qualidadeVideo}
                  onChange={(e) => setQualidadeVideo(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="Auto">Auto</option>
                  <option value="HD">HD</option>
                  <option value="SD">SD</option>
                </select>

                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    gravando ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {gravando ? "🔴 Gravando" : "⭕ Inativo"}
                </div>
              </div>
            </div>

            {/* CANVAS/IMG DO VÍDEO (mantido, com ESP32) */}
            <div className={`relative w-full h-96 ${cameraAtiva ? "bg-black" : "bg-slate-100"}`}>
              {cameraAtiva ? (
                <>
                  {isESP32 ? (
                    <img
                      ref={imgRef}
                      alt="ESP32 feed"
                      className="absolute inset-0 w-full h-full object-contain"
                      style={{
                        filter: cssFilter(),
                        transform: `scale(${configuracoes.zoom / 100})`,
                        transformOrigin: "center center",
                      }}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-contain"
                      playsInline
                      muted={muted}
                      controls={false}
                      crossOrigin="anonymous"
                      style={{
                        filter: cssFilter(),
                        transform: `scale(${configuracoes.zoom / 100})`,
                        transformOrigin: "center center",
                      }}
                    />
                  )}

                  {/* HUD/overlays (mantidos) */}
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

                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-violet-600/80 text-white px-3 py-2 rounded-lg backdrop-blur-sm text-xs shadow-lg">
                      🎯 Reconhecimento {reconhecimentoAtivo ? "Ativo" : "Pausado"}
                    </div>
                    <div className="bg-black/50 text-white px-3 py-2 rounded-lg backdrop-blur-sm text-xs shadow-lg">
                      Qualidade: {qualidadeVideo} • {isESP32 ? "ESP32/MJPEG" : usarProxy ? "HLS/Proxy" : "HLS/Direto"}
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

          {/* CONTROLES / AJUSTES / FPS (mantidos) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <FileVideo className="size-4 text-violet-600" /> Captura
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={capturarFoto}
                  disabled={!cameraAtiva}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all border bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  <Camera className="size-4" /> Capturar Foto
                </button>
              </div>
              <canvas ref={canvasSnapRef} className="hidden" />
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
                      type="range" min="0" max="100" value={value}
                      onChange={(e) => handleConfigChange(config, parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      disabled={!cameraAtiva}
                    />
                  </div>
                ))}
              </div>
            </div>

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

          {/* ARQUIVOS DE GRAVAÇÃO (mantido) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Arquivos de Gravação</h2>
              <div className="text-xs text-slate-500">
                {suporteMediaRecorder() ? "As gravações ficam salvas no navegador (IndexedDB)." : "Seu navegador não suporta gravação."}
              </div>
            </div>

            {recordings.length === 0 ? (
              <div className="text-sm text-slate-500">Nenhuma gravação ainda. Use o botão <b>Gravar</b> lá em cima.</div>
            ) : (
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
                {recordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all hover:border-purple-300 bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-700">🎬</span>
                        </div>
                        <div className="min-w-0">
                          {renamingId === rec.id ? (
                            <input
                              value={renameDraft}
                              onChange={(e) => setRenameDraft(e.target.value)}
                              className="text-sm border rounded px-2 py-1 w-48"
                              autoFocus
                            />
                          ) : (
                            <div className="font-medium text-gray-800 text-sm truncate max-w-[18rem]">
                              {rec.name}
                            </div>
                          )}
                          <div className="text-gray-500 text-xs">
                            {new Date(rec.createdAt).toLocaleString("pt-BR")} • {fmtSize(rec.size)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renamingId === rec.id ? (
                          <button
                            onClick={() => salvarRenome(rec)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          >
                            <Save className="size-3" /> Salvar
                          </button>
                        ) : (
                          <button
                            onClick={() => startRenomear(rec)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            <Pencil className="size-3" /> Renomear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => baixar(rec)}
                        className="inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-lg text-xs font-medium"
                      >
                        <Download className="size-4" /> Baixar
                      </button>
                      <button
                        onClick={() => excluir(rec)}
                        className="inline-flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-lg text-xs font-medium"
                      >
                        <Trash2 className="size-4" /> Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PAINEL LATERAL (mantido) */}
        <div className="space-y-6">
          {/* DETECÇÕES RECENTES */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <ScanFace className="size-4 text-violet-600" /> Detecções Recentes
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {(detectados.length > 0 ? detectados : pessoasDetectadas).slice(0, 8).map((pessoa) => (
                <div key={pessoa.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`size-2.5 rounded-full ${pessoa.status === "Autorizado" ? "bg-emerald-500" : "bg-rose-500"} animate-pulse`} />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 text-sm">{pessoa.nome}</div>
                    <div className="text-slate-500 text-xs">{pessoa.timestamp}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-violet-600">{pessoa.confianca}%</div>
                    <div className={`text-xs ${pessoa.status === "Autorizado" ? "text-emerald-600" : "text-rose-600"}`}>{pessoa.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STATUS DO SISTEMA (mantido) */}
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
                  <div className="bg-gradient-to-r from-blue-500 to-violet-600 h-2 rounded-full" style={{ width: `${volumeStorage}%` }} />
                </div>
              </div>
              <div className="col-span-1">
                <div className="text-xs text-slate-500 mb-2">Uso de CPU</div>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "CPU", value: 42 }]} startAngle={180} endAngle={0}>
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
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "NET", value: 68 }]} startAngle={180} endAngle={0}>
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar background dataKey="value" cornerRadius={6} fill="#22d3ee" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* estilo do thumb dos sliders (mantido) */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none; width: 18px; height: 18px; border-radius: 999px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.2); border: 2px solid white;
        }
        .slider::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 999px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer; border: 2px solid white;
        }
      `}</style>
    </div>
  );
}
