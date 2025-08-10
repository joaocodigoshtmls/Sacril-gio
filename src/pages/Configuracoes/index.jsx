import React, { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged, updatePassword, signOut, deleteUser } from "firebase/auth";

export default function Configuracoes() {
  const [usuario, setUsuario] = useState({
    full_name: "",
    email: "",
    phone: "",
    cpf: "",
    created_at: "",
    updated_at: ""
  });

  const [camposEditaveis, setCamposEditaveis] = useState({
    full_name: false,
    phone: false,
    cpf: false,
  });

  const [senhas, setSenhas] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: ""
  });

  const [mostrarAlterarSenha, setMostrarAlterarSenha] = useState(false);
  const [mostrarExcluirConta, setMostrarExcluirConta] = useState(false);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState("");
  const [senhaExclusao, setSenhaExclusao] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario((prev) => ({
          ...prev,
          full_name: user.displayName || "",
          email: user.email || "",
        }));
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações da conta</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie seus dados e segurança</p>

        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          {/* Perfil */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md">
            <h2 className="font-medium">Perfil</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <Input label="Nome completo" value={usuario.full_name} onChange={(v)=>setUsuario(s=>({...s, full_name:v}))} />
              <Input label="E-mail" value={usuario.email} disabled />
              <Input label="Telefone" value={usuario.phone} onChange={(v)=>setUsuario(s=>({...s, phone:v}))} />
              <Input label="CPF" value={usuario.cpf} onChange={(v)=>setUsuario(s=>({...s, cpf:v}))} />
            </div>
            <div className="mt-4">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:brightness-110 transition">Salvar alterações</button>
            </div>
          </section>

          {/* Segurança */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md">
            <h2 className="font-medium">Segurança</h2>

            <button
              onClick={() => setMostrarAlterarSenha((v)=>!v)}
              className="mt-4 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition"
            >
              {mostrarAlterarSenha ? "Fechar" : "Alterar senha"}
            </button>

            {mostrarAlterarSenha && (
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                <Input type="password" label="Senha atual" value={senhas.senhaAtual} onChange={(v)=>setSenhas(s=>({...s, senhaAtual:v}))}/>
                <Input type="password" label="Nova senha" value={senhas.novaSenha} onChange={(v)=>setSenhas(s=>({...s, novaSenha:v}))}/>
                <Input type="password" label="Confirmar senha" value={senhas.confirmarSenha} onChange={(v)=>setSenhas(s=>({...s, confirmarSenha:v}))}/>
                <div className="sm:col-span-3">
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:brightness-110 transition">Atualizar senha</button>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => setMostrarExcluirConta((v)=>!v)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition"
              >
                {mostrarExcluirConta ? "Fechar" : "Excluir conta"}
              </button>

              {mostrarExcluirConta && (
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  <Input label="Digite 'EXCLUIR'" value={confirmacaoExclusao} onChange={setConfirmacaoExclusao}/>
                  <Input type="password" label="Senha" value={senhaExclusao} onChange={setSenhaExclusao}/>
                  <div className="flex items-end">
                    <button className="bg-rose-600 text-white px-4 py-2 rounded-xl hover:brightness-110 transition">Confirmar exclusão</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type="text", disabled=false }) {
  return (
    <label className="text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <input
        type={type}
        disabled={disabled}
        value={value || ""}
        onChange={(e)=>onChange?.(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 outline-none focus:ring-2 ring-indigo-500/30"
      />
    </label>
  );
}
