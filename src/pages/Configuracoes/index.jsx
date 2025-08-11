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
  const [mostrarSenha, setMostrarSenha] = useState({
    atual: false,
    nova: false,
    confirmar: false
  });

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
      const response = await fetch('http://localhost:3001/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUsuario(userData);
      } else {
        const error = await response.json();
        console.error('❌ Erro ao buscar dados:', error);
        
        if (response.status === 401 || response.status === 403) {
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

  // ✅ useEffect de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(prev => ({
          ...prev,
          email: user.email || "",
          full_name: user.displayName || ""
        }));
        
        let token = obterToken();
        
        if (!token) {
          token = await sincronizarUsuarioFirebase(user);
        }
        
        if (token) {
          await buscarDadosUsuario(token);
        } else {
          setCarregandoPerfil(false);
        }
      } else {
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
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      sessionStorage.clear();
      
      await signOut(auth);
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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">⚙️ Configurações da Conta</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e configurações de segurança</p>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Informações Pessoais */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-black text-xl">
                👤
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Informações Pessoais</h2>
                <p className="text-gray-600">Atualize seus dados básicos</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {obterLabelCampo('full_name')} *
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={usuario.full_name}
                      disabled={!camposEditaveis.full_name}
                      onChange={(e) => setUsuario({ ...usuario, full_name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        camposEditaveis.full_name 
                          ? "border-purple-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" 
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                  <button
                    onClick={() => handleEditarCampo('full_name')}
                    disabled={camposEditaveis.full_name}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      camposEditaveis.full_name
                        ? "bg-green-100 text-green-600 cursor-default"
                        : "bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-600"
                    }`}
                  >
                    {camposEditaveis.full_name ? "📝" : "✏️"}
                  </button>
                </div>
              </div>

              {/* Email (somente leitura) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={usuario.email}
                    disabled={true}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500"
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    🔒
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Email não pode ser alterado por questões de segurança</p>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {obterLabelCampo('phone')}
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={usuario.phone || ''}
                      disabled={!camposEditaveis.phone}
                      onChange={(e) => setUsuario({ ...usuario, phone: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        camposEditaveis.phone 
                          ? "border-purple-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" 
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <button
                    onClick={() => handleEditarCampo('phone')}
                    disabled={camposEditaveis.phone}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      camposEditaveis.phone
                        ? "bg-green-100 text-green-600 cursor-default"
                        : "bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-600"
                    }`}
                  >
                    {camposEditaveis.phone ? "📝" : "✏️"}
                  </button>
                </div>
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {obterLabelCampo('cpf')}
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={usuario.cpf || ''}
                      disabled={!camposEditaveis.cpf}
                      onChange={(e) => setUsuario({ ...usuario, cpf: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        camposEditaveis.cpf 
                          ? "border-purple-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" 
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <button
                    onClick={() => handleEditarCampo('cpf')}
                    disabled={camposEditaveis.cpf}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      camposEditaveis.cpf
                        ? "bg-green-100 text-green-600 cursor-default"
                        : "bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-600"
                    }`}
                  >
                    {camposEditaveis.cpf ? "📝" : "✏️"}
                  </button>
                </div>
              </div>

              {/* Botão Salvar */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={handleSalvarAlteracoes}
                  disabled={carregando || !Object.values(camposEditaveis).some(v => v)}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {carregando ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>💾</span>
                      <span>Salvar Alterações</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Configurações de Segurança */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white text-xl">
                🔒
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Segurança</h2>
                <p className="text-gray-600">Gerencie sua senha e segurança da conta</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Alterar Senha */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setMostrarAlterarSenha(!mostrarAlterarSenha)}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-600 text-xl">🔑</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">Alterar Senha</div>
                      <div className="text-gray-600 text-sm">Atualize sua senha de acesso</div>
                    </div>
                  </div>
                  <span className={`transform transition-transform ${mostrarAlterarSenha ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {mostrarAlterarSenha && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type={mostrarSenha.atual ? "text" : "password"}
                          placeholder="Senha atual"
                          value={senhas.senhaAtual}
                          onChange={(e) => setSenhas({...senhas, senhaAtual: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha({...mostrarSenha, atual: !mostrarSenha.atual})}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {mostrarSenha.atual ? "🙈" : "👁️"}
                        </button>
                      </div>
                      
                      <div className="relative">
                        <input
                          type={mostrarSenha.nova ? "text" : "password"}
                          placeholder="Nova senha (mín. 6 caracteres)"
                          value={senhas.novaSenha}
                          onChange={(e) => setSenhas({...senhas, novaSenha: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha({...mostrarSenha, nova: !mostrarSenha.nova})}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {mostrarSenha.nova ? "🙈" : "👁️"}
                        </button>
                      </div>
                      
                      <div className="relative">
                        <input
                          type={mostrarSenha.confirmar ? "text" : "password"}
                          placeholder="Confirmar nova senha"
                          value={senhas.confirmarSenha}
                          onChange={(e) => setSenhas({...senhas, confirmarSenha: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha({...mostrarSenha, confirmar: !mostrarSenha.confirmar})}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {mostrarSenha.confirmar ? "🙈" : "👁️"}
                        </button>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={handleAlterarSenha}
                          disabled={carregando || !senhas.senhaAtual || !senhas.novaSenha || !senhas.confirmarSenha}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-50"
                        >
                          {carregando ? "Alterando..." : "Confirmar"}
                        </button>
                        <button
                          onClick={() => {
                            setMostrarAlterarSenha(false);
                            setSenhas({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
                          }}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Excluir Conta */}
              <div className="border border-red-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setMostrarExcluirConta(!mostrarExcluirConta)}
                  className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-red-600 text-xl">🗑️</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">Excluir Conta</div>
                      <div className="text-gray-600 text-sm">Remover permanentemente sua conta</div>
                    </div>
                  </div>
                  <span className={`transform transition-transform ${mostrarExcluirConta ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {mostrarExcluirConta && (
                  <div className="p-4 bg-white border-t border-red-200">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-red-800 text-sm font-medium mb-2">⚠️ Atenção: Esta ação é irreversível!</p>
                      <p className="text-red-700 text-sm">Todos os seus dados serão permanentemente removidos e não poderão ser recuperados.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <input
                        type="password"
                        placeholder="Digite sua senha para confirmar"
                        value={senhaExclusao}
                        onChange={(e) => setSenhaExclusao(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                      />
                      
                      <input
                        type="text"
                        placeholder='Digite "EXCLUIR" para confirmar'
                        value={confirmacaoExclusao}
                        onChange={(e) => setConfirmacaoExclusao(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                      />
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={handleExcluirConta}
                          disabled={carregando || confirmacaoExclusao !== "EXCLUIR" || !senhaExclusao}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-50"
                        >
                          {carregando ? "Excluindo..." : "Excluir Conta"}
                        </button>
                        <button
                          onClick={() => {
                            setMostrarExcluirConta(false);
                            setConfirmacaoExclusao("");
                            setSenhaExclusao("");
                          }}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Painel lateral - Informações da conta */}
        <div className="space-y-6">
          {/* Informações da Conta */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                📊
              </div>
              <h3 className="text-lg font-bold text-gray-800">Informações da Conta</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 text-sm">Status da Conta</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  ✅ Ativa
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 text-sm">Email</span>
                <span className="text-gray-800 font-medium text-sm">{usuario.email}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 text-sm">Criada em</span>
                <span className="text-gray-800 font-medium text-sm">{formatarData(usuario.created_at)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 text-sm">Última atualização</span>
                <span className="text-gray-800 font-medium text-sm">{formatarData(usuario.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Configurações de Privacidade */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-gray-800">Privacidade</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800 text-sm">Autenticação 2FA</div>
                  <div className="text-gray-500 text-xs">Segurança adicional</div>
                </div>
                <div className="bg-gray-300 w-12 h-6 rounded-full p-1 cursor-pointer">
                  <div className="bg-white w-4 h-4 rounded-full transition-transform"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800 text-sm">Notificações</div>
                  <div className="text-gray-500 text-xs">Alertas por email</div>
                </div>
                <div className="bg-blue-500 w-12 h-6 rounded-full p-1 cursor-pointer">
                  <div className="bg-white w-4 h-4 rounded-full transform translate-x-6 transition-transform"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800 text-sm">Backup Automático</div>
                  <div className="text-gray-500 text-xs">Dados seguros</div>
                </div>
                <div className="bg-blue-500 w-12 h-6 rounded-full p-1 cursor-pointer">
                  <div className="bg-white w-4 h-4 rounded-full transform translate-x-6 transition-transform"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-gray-800">Ações Rápidas</h3>
            </div>
            
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <span className="text-blue-600">💾</span>
                <span className="text-gray-800 font-medium text-sm">Exportar Dados</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <span className="text-green-600">🔄</span>
                <span className="text-gray-800 font-medium text-sm">Sincronizar</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <span className="text-orange-600">📋</span>
                <span className="text-gray-800 font-medium text-sm">Ver Atividades</span>
              </button>
            </div>
          </div>

          {/* Suporte */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">💬</span>
              <h3 className="text-lg font-bold">Precisa de Ajuda?</h3>
            </div>
            
            <p className="text-purple-100 text-sm mb-4">
              Nossa equipe está sempre pronta para ajudar você com qualquer dúvida.
            </p>
            
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-black py-3 px-4 rounded-lg font-semibold transition-all">
              Entrar em Contato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}