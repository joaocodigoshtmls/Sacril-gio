// src/pages/Dashboard/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const [periodo, setPeriodo] = useState("7dias");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const reconhecimentosPorHora = useMemo(
    () =>
      new Array(24).fill(0).map((_, i) => ({
        hora: `${String(i).padStart(2, "0")}:00`,
        valor: Math.floor(Math.abs(Math.sin(i / 3)) * 20 + 5),
      })),
    []
  );

  const btnBase = "px-4 py-2 rounded-xl text-sm transition-all border";
  const btnActive =
    "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white border-transparent shadow-md shadow-fuchsia-200";
  const btnIdle =
    "bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:text-violet-600";

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Cabeçalho + filtros */}
      <div className="px-6 pt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-slate-800">Visão Geral</h1>
            <p className="text-slate-500 mt-1">
              Resumo de atividade, precisão e eventos de segurança
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/70 p-1 rounded-2xl border border-slate-200">
            {[
              { k: "24h", label: "24h" },
              { k: "7dias", label: "7 dias" },
              { k: "30dias", label: "30 dias" },
            ].map((b) => (
              <button
                key={b.k}
                onClick={() => setPeriodo(b.k)}
                className={`${btnBase} ${periodo === b.k ? btnActive : btnIdle}`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico ocupa a largura toda */}
      <div className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-none sm:rounded-2xl border-t sm:border border-slate-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-slate-800">
                Reconhecimentos por hora
              </h3>
              <p className="text-slate-500 text-sm">
                {periodo === "24h"
                  ? "Últimas 24 horas"
                  : periodo === "7dias"
                  ? "Média por hora (últimos 7 dias)"
                  : "Média por hora (últimos 30 dias)"}
              </p>
            </div>
            <button
              onClick={() => {/* atualizar dados */}}
              className="text-violet-600 hover:text-violet-700 text-sm"
            >
              Atualizar
            </button>
          </div>

          <div className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={reconhecimentosPorHora}
                margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradRecon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef2ff" strokeDasharray="3 3" />
                <XAxis
                  dataKey="hora"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval={2}
                  tickMargin={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  width={34}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: "#c7d2fe", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 6px 24px rgba(2,6,23,0.08)",
                  }}
                  formatter={(v) => [`${v} detecções`, "Valor"]}
                  labelFormatter={(l) => `Hora: ${l}`}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#gradRecon)"
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Parte de baixo mantida */}
      <div className="px-6 mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Câmeras */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 p-4">
          <h3 className="text-lg font-medium text-slate-800">Câmeras</h3>
          <p className="text-slate-500 text-sm mb-4">Status em tempo real</p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[
              "Portaria",
              "Galpão",
              "Estacionamento",
              "Corredor 1",
              "Data Center",
              "Recepção",
            ].map((nome) => (
              <div
                key={nome}
                className="border border-slate-200 rounded-xl p-3 flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-slate-700">{nome}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    FPS: 28 &nbsp; Bitrate: 4.1 Mbps
                  </div>
                </div>
                <div className="text-slate-400">📷</div>
              </div>
            ))}
          </div>
        </div>

        {/* Eventos recentes */}
        <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-4">
          <h3 className="text-lg font-medium text-slate-800">Eventos recentes</h3>
          <p className="text-slate-500 text-sm mb-4">Últimos 30 min</p>

          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-xl px-3 py-2.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-rose-500" />
                  <span className="text-sm text-slate-700">
                    Alerta de acesso negado
                  </span>
                </div>
                <span className="text-xs text-slate-400">{i + 2} min</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
