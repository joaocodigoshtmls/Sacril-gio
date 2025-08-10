import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Acesse sua conta</p>

        <div className="mt-6 space-y-3">
          <label className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-indigo-500/30"
            />
          </label>

          <label className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(e)=>setSenha(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-indigo-500/30"
            />
          </label>

          <button className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:brightness-110 transition">
            Entrar
          </button>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Não tem conta? <Link to="/cadastro" className="text-indigo-600 hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
