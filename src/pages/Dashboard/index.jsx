import React, { useEffect, useMemo, useState } from "react";
import { Activity, Cpu, Camera, AlertTriangle, Clock, RefreshCcw, ArrowUpRight } from "lucide-react";

export default function Dashboard() {
  const [periodo, setPeriodo] = useState('7dias');
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    reconhecimentosHoje: 156,
    precisao: 94.8,
    tempoMedioResposta: 0.3,
    tentativasNegadas: 12
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const reconhecimentosPorHora = useMemo(() => (new Array(24).fill(0).map((_,i) => ({
    hora: `${String(i).padStart(2,'0')}:00`,
    valor: Math.floor(Math.abs(Math.sin(i/3))*20 + 5)
  }))), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visão Geral</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Resumo de atividade, precisão e eventos de segurança</p>
        </div>
        <div className="flex gap-2">
          {['24h','7dias','30dias'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-2 rounded-xl text-sm border transition ${periodo===p ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Reconhecimentos (hoje)" value={dados.reconhecimentosHoje} icon={Activity} trend="+12%" tone="indigo" loading={loading} />
        <KpiCard title="Precisão" value={dados.precisao + '%'} icon={Cpu} trend="+0.8%" tone="emerald" loading={loading} />
        <KpiCard title="Tempo médio (s)" value={dados.tempoMedioResposta} icon={Clock} trend="-5%" tone="amber" loading={loading} />
        <KpiCard title="Tentativas negadas" value={dados.tentativasNegadas} icon={AlertTriangle} trend="+1" tone="rose" loading={loading} />
      </div>

      {/* Mini bar chart em Tailwind */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-medium">Reconhecimentos por hora</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Últimas 24 horas</p>
          </div>
          <button className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition flex items-center gap-1">
            <RefreshCcw size={12}/> Atualizar
          </button>
        </div>
        <div className="h-40 flex items-end gap-1">
          {reconhecimentosPorHora.map((b, idx) => (
            <div key={idx} className="relative group flex-1">
              <div className="w-full bg-gradient-to-t from-indigo-500/60 to-fuchsia-500/80 rounded-t-xl transition-all duration-300" style={{height: `${b.valor*3}px`}} />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition text-[10px] bg-slate-900 text-white px-2 py-1 rounded-md whitespace-nowrap">{b.hora}: {b.valor}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Câmeras + Eventos */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Section title="Câmeras" subtitle="Status em tempo real">
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {['Portaria','Galpão','Estacionamento','Corredor 1','Data Center','Recepção'].map((n, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md hover:shadow-lg hover:shadow-indigo-500/10 transition group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse" />
                      <p className="text-sm font-medium">{n}</p>
                    </div>
                    <Camera size={16} className="text-slate-500 group-hover:text-indigo-600 transition" />
                  </div>
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex gap-3">
                    <span>FPS: {Math.floor(Math.random()*5)+25}</span>
                    <span>Bitrate: {(Math.random()*2+3).toFixed(1)} Mbps</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Eventos recentes" subtitle="Últimos 30 min">
            <ul className="space-y-2 text-sm">
              {new Array(6).fill(0).map((_,i)=>(
                <li key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Alerta de acesso negado</span>
                  </div>
                  <span className="text-xs text-slate-500">há {i+2} min</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }){
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md">
      <div className="mb-4">
        <h2 className="font-medium">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function KpiCard({ title, value, icon:Icon, trend, tone='indigo', loading }){
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-4">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-600/10 to-fuchsia-600/20 blur-2xl" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-semibold tracking-tight mt-1">
            {loading ? <span className="inline-block h-7 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" /> : value}
          </p>
        </div>
        <div className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-tr from-indigo-600 to-fuchsia-600 text-white shadow-md shadow-indigo-600/30">
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-3 text-xs">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <ArrowUpRight size={12} /> {trend}
        </span>
      </div>
    </div>
  )
}
