import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

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
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);

  const navigate = useNavigate();

  // ✅ Função para obter token - verifica múltiplas possibilidades
  const obterToken = () => {
    const possiveisTokens = [
      localStorage.getItem('authToken'),
      localStorage.getItem('token'),
      localStorage.getItem('accessToken'),
      localStorage.getItem('jwt'),
      sessionStorage.getItem('authToken'),
      sessionStorage.getItem('token')
    ];

    return possiveisTokens.find(token => token !== null) || null;
  };

  // ✅ Função para sincronizar usuário Firebase com MariaDB
  const sincronizarUsuarioFirebase = async (user) => {
    try {
      console.log('🔄 Sincronizando usuário do Firebase com MariaDB...');
      
      const response = await fetch('http://localhost:3001/api/sync-firebase-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firebaseEmail: user.email,
          firebaseDisplayName: user.displayName,
          firebaseUid: user.uid
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Usuário sincronizado:', data);
        
        // Salva o token JWT no localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.userId);
        
        console.log('🎫 Token JWT salvo no localStorage');
        return data.token;
      } else {
        console.error('❌ Erro na sincronização:', data);
        return null;
      }
    } catch (error) {
      console.error('💥 Erro na requisição de sincronização:', error);
      return null;
    }
  };

  // ✅ Função para buscar dados do usuário do MariaDB
  const buscarDadosUsuario = async (token) => {
    try {
      console.log('🔍 Buscando dados do usuário com token:', token ? 'Token encontrado' : 'Token não encontrado');
      
      const response = await fetch('http://localhost:3001/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Resposta da API:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Dados recebidos:', userData);
        setUsuario(userData);
      } else {
        const error = await response.json();
        console.error('❌ Erro ao buscar dados:', error);
        
        // Se o token for inválido, remove e tenta sincronizar novamente
        if (response.status === 401 || response.status === 403) {
          console.log('🔄 Token inválido, limpando dados locais...');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
        }
      }
    } catch (error) {
      console.error('💥 Erro na requisição:', error);
    } finally {
      setCarregandoPerfil(false);
    }
  };

  // ✅ useEffect corrigido
  useEffect(() => {
    console.log('🔄 Iniciando verificação de autenticação...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('👤 Estado do Firebase Auth:', user ? 'Usuário logado' : 'Usuário não logado');
      
      if (user) {
        console.log('📧 Email do usuário:', user.email);
        console.log('🆔 UID do Firebase:', user.uid);
        
        // Carrega dados básicos do Firebase imediatamente
        setUsuario(prev => ({
          ...prev,
          email: user.email || "",
          full_name: user.displayName || ""
        }));
        
        // Verifica se já tem token salvo
        let token = obterToken();
        
        if (!token) {
          console.log('🔄 Token não encontrado, sincronizando com MariaDB...');
          // Se não tem token, sincroniza com MariaDB
          token = await sincronizarUsuarioFirebase(user);
        }
        
        if (token) {
          console.log('🎫 Token encontrado, buscando dados completos...');
          await buscarDadosUsuario(token);
        } else {
          console.log('❌ Não foi possível obter token, usando apenas dados do Firebase');
          setCarregandoPerfil(false);
        }
      } else {
        console.log('❌ Usuário não logado no Firebase, redirecionando...');
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSalvarAlteracoes = async () => {
    setCarregando(true);
    try {
      const token = obterToken();
      if (!token) {
        alert('Token de autenticação não encontrado. Faça login novamente.');
        navigate("/login");
        return;
      }

      const response = await fetch('http://localhost:3001/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: usuario.full_name,
          phone: usuario.phone,
          cpf: usuario.cpf
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUsuario(data.user);
        setCamposEditaveis({
          full_name: false,
          phone: false,
          cpf: false,
        });
        alert('Dados atualizados com sucesso!');
      } else {
        alert('Erro ao atualizar dados: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      alert('Erro ao atualizar dados: ' + error.message);
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

    if (!senhas.senhaAtual) {
      alert("Digite sua senha atual!");
      return;
    }

    setCarregando(true);
    try {
      const token = obterToken();
      const response = await fetch('http://localhost:3001/api/user/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: senhas.senhaAtual,
          newPassword: senhas.novaSenha
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Senha alterada com sucesso!');
        setSenhas({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
        setMostrarAlterarSenha(false);
      } else {
        alert('Erro ao alterar senha: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleSair = async () => {
    try {
      console.log('🚪 Realizando logout...');
      
      // Limpa todos os dados locais
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      sessionStorage.clear();
      
      // Faz logout do Firebase
      await signOut(auth);
      
      console.log('✅ Logout realizado com sucesso');
      navigate("/login");
    } catch (error) {
      console.error("❌ Erro ao sair:", error);
      alert("Erro ao sair da conta");
    }
  };

  const handleExcluirConta = async () => {
    if (confirmacaoExclusao !== "EXCLUIR") {
      alert('Digite "EXCLUIR" para confirmar a exclusão da conta');
      return;
    }

    if (!senhaExclusao) {
      alert('Digite sua senha para confirmar a exclusão');
      return;
    }

    if (!window.confirm("Tem certeza? Esta ação não pode ser desfeita!")) {
      return;
    }

    setCarregando(true);
    try {
      const token = obterToken();
      const response = await fetch('http://localhost:3001/api/user/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: senhaExclusao
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Conta excluída com sucesso!');
        await signOut(auth);
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login");
      } else {
        alert('Erro ao excluir conta: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      alert('Erro ao excluir conta: ' + error.message);
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
      full_name: "Nome Completo",
      email: "Email",
      phone: "Telefone",
      cpf: "CPF"
    };
    return labels[campo] || campo;
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  if (carregandoPerfil) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
          <p className="mt-2 text-sm text-gray-500">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-4xl bg-white shadow-md rounded p-6 mt-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-gray-800">Minha Conta</h2>
          <button
            onClick={handleSair}
            disabled={carregando}
            className="bg-red-500 hover:bg-red-600 text-black px-4 py-2 rounded transition disabled:opacity-50"
          >
            {carregando ? "Saindo..." : "Sair"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Pessoais */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Informações Pessoais</h3>
            
            <div className="flex flex-col gap-4">
              {/* Nome */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">
                  {obterLabelCampo('full_name')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={usuario.full_name}
                    disabled={!camposEditaveis.full_name}
                    onChange={(e) =>
                      setUsuario({ ...usuario, full_name: e.target.value })
                    }
                    className={`border rounded-lg px-4 py-2 flex-1 transition ${
                      camposEditaveis.full_name 
                        ? "border-blue-300 bg-white" 
                        : "border-gray-200 bg-gray-50"
                    }`}
                    placeholder="Digite seu nome completo"
                  />
                  <button
                    onClick={() => handleEditarCampo('full_name')}
                    disabled={camposEditaveis.full_name}
                    className={`p-2 rounded-lg transition ${
                      camposEditaveis.full_name
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                  >
                    {camposEditaveis.full_name ? "📝" : "✏️"}
                  </button>
                </div>
              </div>

              {/* Email (somente leitura) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">Email</label>
                <input
                  type="email"
                  value={usuario.email}
                  disabled={true}
                  className="border border-gray-200 bg-gray-100 rounded-lg px-4 py-2 text-gray-500"
                  title="Email não pode ser alterado"
                />
                <p className="text-xs text-gray-500">Email não pode ser alterado</p>
              </div>

              {/* Telefone */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">
                  {obterLabelCampo('phone')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={usuario.phone || ''}
                    disabled={!camposEditaveis.phone}
                    onChange={(e) =>
                      setUsuario({ ...usuario, phone: e.target.value })
                    }
                    className={`border rounded-lg px-4 py-2 flex-1 transition ${
                      camposEditaveis.phone 
                        ? "border-blue-300 bg-white" 
                        : "border-gray-200 bg-gray-50"
                    }`}
                    placeholder="Digite seu telefone"
                  />
                  <button
                    onClick={() => handleEditarCampo('phone')}
                    disabled={camposEditaveis.phone}
                    className={`p-2 rounded-lg transition ${
                      camposEditaveis.phone
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                  >
                    {camposEditaveis.phone ? "📝" : "✏️"}
                  </button>
                </div>
              </div>

              {/* CPF */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">
                  {obterLabelCampo('cpf')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={usuario.cpf || ''}
                    disabled={!camposEditaveis.cpf}
                    onChange={(e) =>
                      setUsuario({ ...usuario, cpf: e.target.value })
                    }
                    className={`border rounded-lg px-4 py-2 flex-1 transition ${
                      camposEditaveis.cpf 
                        ? "border-blue-300 bg-white" 
                        : "border-gray-200 bg-gray-50"
                    }`}
                    placeholder="Digite seu CPF"
                  />
                  <button
                    onClick={() => handleEditarCampo('cpf')}
                    disabled={camposEditaveis.cpf}
                    className={`p-2 rounded-lg transition ${
                      camposEditaveis.cpf
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                  >
                    {camposEditaveis.cpf ? "📝" : "✏️"}
                  </button>
                </div>
              </div>

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
                      placeholder="Senha atual"
                      value={senhas.senhaAtual}
                      onChange={(e) => setSenhas({...senhas, senhaAtual: e.target.value})}
                      className="w-full border rounded-lg px-4 py-2"
                    />
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
                        disabled={carregando || !senhas.senhaAtual || !senhas.novaSenha || !senhas.confirmarSenha}
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
                    <p><strong>Criada em:</strong> {formatarData(usuario.created_at)}</p>
                    <p><strong>Atualizada em:</strong> {formatarData(usuario.updated_at)}</p>
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
                      type="password"
                      placeholder="Digite sua senha para confirmar"
                      value={senhaExclusao}
                      onChange={(e) => setSenhaExclusao(e.target.value)}
                      className="w-full border border-red-300 rounded-lg px-4 py-2 mb-3"
                    />
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
                        disabled={carregando || confirmacaoExclusao !== "EXCLUIR" || !senhaExclusao}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                      >
                        {carregando ? "Excluindo..." : "Excluir Conta"}
                      </button>
                      <button
                        onClick={() => {
                          setMostrarExcluirConta(false);
                          setConfirmacaoExclusao("");
                          setSenhaExclusao("");
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-black px-4 py-2 rounded-lg transition"
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