import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged, updatePassword, signOut, deleteUser } from "firebase/auth";

export default function Configuracoes() {
  const [usuario, setUsuario] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
  });

  const [camposEditaveis, setCamposEditaveis] = useState({
    nome: false,
    email: false,
    telefone: false,
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
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  // ✅ Escuta mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario({
          nome: user.displayName || "",
          email: user.email || "",
          telefone: user.phoneNumber || "",
          cpf: "",
        });
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSalvarAlteracoes = async () => {
    setCarregando(true);
    try {
      if (auth.currentUser) {
        await auth.currentUser.updateProfile({
          displayName: usuario.nome,
        });

        if (usuario.email !== auth.currentUser.email) {
          await auth.currentUser.updateEmail(usuario.email);
        }

        // Desabilita todos os campos após salvar
        setCamposEditaveis({
          nome: false,
          email: false,
          telefone: false,
          cpf: false,
        });

        alert("Dados atualizados com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      alert("Erro ao atualizar dados: " + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (senhas.novaSenha !== senhas.confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    if (senhas.novaSenha.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres!");
      return;
    }

    setCarregando(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, senhas.novaSenha);
        alert("Senha alterada com sucesso!");
        setSenhas({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
        setMostrarAlterarSenha(false);
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      alert("Erro ao alterar senha: " + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleSair = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
      alert("Erro ao sair da conta");
    }
  };

  const handleExcluirConta = async () => {
    if (confirmacaoExclusao !== "EXCLUIR") {
      alert('Digite "EXCLUIR" para confirmar a exclusão da conta');
      return;
    }

    if (!window.confirm("Tem certeza? Esta ação não pode ser desfeita!")) {
      return;
    }

    setCarregando(true);
    try {
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
        alert("Conta excluída com sucesso!");
        navigate("/login");
      }
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      alert("Erro ao excluir conta: " + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleEditarCampo = (campo) => {
    setCamposEditaveis({
      ...camposEditaveis,
      [campo]: true,
    });
  };

  const obterLabelCampo = (campo) => {
    const labels = {
      nome: "Nome Completo",
      email: "Email",
      telefone: "Telefone",
      cpf: "CPF"
    };
    return labels[campo] || campo;
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-4xl bg-white shadow-md rounded p-6 mt-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-gray-800">Minha Conta</h2>
          <button
            onClick={handleSair}
            disabled={carregando}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
          >
            {carregando ? "Saindo..." : "Sair"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Pessoais */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Informações Pessoais</h3>
            
            <div className="flex flex-col gap-4">
              {Object.keys(usuario).map((campo) => (
                <div key={campo} className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-600">
                    {obterLabelCampo(campo)}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={campo === "email" ? "email" : "text"}
                      value={usuario[campo]}
                      disabled={!camposEditaveis[campo]}
                      onChange={(e) =>
                        setUsuario({ ...usuario, [campo]: e.target.value })
                      }
                      className={`border rounded-lg px-4 py-2 flex-1 transition ${
                        camposEditaveis[campo] 
                          ? "border-blue-300 bg-white" 
                          : "border-gray-200 bg-gray-50"
                      }`}
                      placeholder={`Digite seu ${obterLabelCampo(campo).toLowerCase()}`}
                    />
                    <button
                      onClick={() => handleEditarCampo(campo)}
                      disabled={camposEditaveis[campo]}
                      className={`p-2 rounded-lg transition ${
                        camposEditaveis[campo]
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                      title={camposEditaveis[campo] ? "Campo habilitado para edição" : "Clique para editar"}
                    >
                      {camposEditaveis[campo] ? "📝" : "✏️"}
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleSalvarAlteracoes}
                disabled={carregando || !Object.values(camposEditaveis).some(v => v)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {carregando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>

          {/* Configurações de Segurança */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Configurações de Segurança</h3>
            
            <div className="flex flex-col gap-4">
              {/* Alterar Senha */}
              <div className="border-b border-gray-200 pb-4">
                <button
                  onClick={() => setMostrarAlterarSenha(!mostrarAlterarSenha)}
                  className="w-full text-left bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg transition"
                >
                  🔒 Alterar Senha
                </button>
                
                {mostrarAlterarSenha && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="password"
                      placeholder="Nova senha"
                      value={senhas.novaSenha}
                      onChange={(e) => setSenhas({...senhas, novaSenha: e.target.value})}
                      className="w-full border rounded-lg px-4 py-2"
                    />
                    <input
                      type="password"
                      placeholder="Confirmar nova senha"
                      value={senhas.confirmarSenha}
                      onChange={(e) => setSenhas({...senhas, confirmarSenha: e.target.value})}
                      className="w-full border rounded-lg px-4 py-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAlterarSenha}
                        disabled={carregando || !senhas.novaSenha || !senhas.confirmarSenha}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                      >
                        {carregando ? "Alterando..." : "Confirmar"}
                      </button>
                      <button
                        onClick={() => {
                          setMostrarAlterarSenha(false);
                          setSenhas({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Informações da Conta */}
              <div className="border-b border-gray-200 pb-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">📊 Informações da Conta</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Email:</strong> {usuario.email}</p>
                    <p><strong>Criada em:</strong> {auth.currentUser?.metadata?.creationTime ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    <p><strong>Último login:</strong> {auth.currentUser?.metadata?.lastSignInTime ? new Date(auth.currentUser.metadata.lastSignInTime).toLocaleDateString('pt-BR') : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Excluir Conta */}
              <div>
                <button
                  onClick={() => setMostrarExcluirConta(!mostrarExcluirConta)}
                  className="w-full text-left bg-red-50 hover:bg-red-100 text-red-700 px-4 py-3 rounded-lg transition"
                >
                  🗑️ Excluir Conta
                </button>
                
                {mostrarExcluirConta && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm mb-3">
                      ⚠️ Esta ação não pode ser desfeita! Todos os seus dados serão permanentemente removidos.
                    </p>
                    <input
                      type="text"
                      placeholder='Digite "EXCLUIR" para confirmar'
                      value={confirmacaoExclusao}
                      onChange={(e) => setConfirmacaoExclusao(e.target.value)}
                      className="w-full border border-red-300 rounded-lg px-4 py-2 mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleExcluirConta}
                        disabled={carregando || confirmacaoExclusao !== "EXCLUIR"}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                      >
                        {carregando ? "Excluindo..." : "Excluir Conta"}
                      </button>
                      <button
                        onClick={() => {
                          setMostrarExcluirConta(false);
                          setConfirmacaoExclusao("");
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}