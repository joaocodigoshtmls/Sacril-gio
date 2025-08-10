import React from "react";
import { Link } from "react-router-dom";
import { Shield, Camera, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl">
        <div className="max-w-none">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">FaceRec • CFTV</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Monitoramento em tempo real, reconhecimento e insights — tudo em uma só interface.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <Feature icon={Camera} title="Câmeras em tempo real" desc="Grade fluida com status e FPS." />
            <Feature icon={Activity} title="Insights instantâneos" desc="Métricas e eventos recentes." />
            <Feature icon={Shield} title="Segurança reforçada" desc="TLS 1.3 • 256-bit • RBAC." />
          </div>

          <div className="mt-8 flex gap-3">
            <Link
              to="/dashboard"
              className="bg-indigo-600 text-white px-5 py-3 rounded-xl hover:brightness-110 transition"
            >
              Ir para o Dashboard
            </Link>
            <Link
              to="/monitoramento"
              className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition"
            >
              Abrir Monitoramento
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md">
      <div className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-tr from-indigo-600 to-fuchsia-600 text-white shadow-md shadow-indigo-600/30">
        <Icon size={18} />
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
    </div>
  );
}
