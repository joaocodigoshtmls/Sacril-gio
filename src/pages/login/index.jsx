import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider, signInWithPopup } from "../../firebase";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Usuário logado com Google:", result.user);

      const usuario = {
        nome: result.user.displayName,
        email: result.user.email,
        foto: result.user.photoURL,
      };

      localStorage.setItem("usuario", JSON.stringify(usuario));
      navigate("/home");
    } catch (error) {
      console.error("Erro no login com Google:", error);
      alert("Falha no login com Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", res.status, data);

      if (!res.ok) throw new Error(data.error || "Erro no login");

      localStorage.setItem("token", data.token);

      // Gera dados básicos do usuário localmente
      const usuario = {
        email: formData.email,
        nome: formData.email.split("@")[0],
      };

      localStorage.setItem("usuario", JSON.stringify(usuario));

      navigate("/home");
    } catch (err) {
      console.error("Login falhou:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden">
      {/* Background com gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Efeito de partículas flutuantes */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute bg-white rounded-full animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Container principal */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-6xl mx-4">
        {/* Lado esquerdo - Imagem/Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-white/10 backdrop-blur-md rounded-l-3xl p-12 flex-col justify-center items-center text-white border border-white/20 relative overflow-hidden">
          {/* Background Pattern Animado */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    backgroundColor: 'rgba(255,255,255,0.6)',
                    borderRadius: '50%',
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${Math.random() * 2 + 2}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Formas geométricas decorativas */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-20 h-20 bg-gradient-to-tr from-pink-400/20 to-blue-400/20 rounded-lg rotate-45 animate-bounce" style={{animationDuration: '3s'}}></div>
          <div className="absolute top-1/4 left-16 w-16 h-16 border-4 border-white/20 rounded-full animate-spin" style={{animationDuration: '8s'}}></div>
          
          <div className="relative z-10 text-center max-w-md">
            {/* Logo com efeitos especiais */}
            <div className="relative mb-8">
              <div className="w-40 h-40 mx-auto rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full animate-pulse opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-2 bg-gradient-to-r from-slate-800 to-slate-900 rounded-full"></div>
                
                {/* Logo */}
                <img 
                  src="/facerec-logo.png" 
                  alt="FaceRec Logo" 
                  className="relative z-10 w-32 h-32 object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Anel orbital */}
                <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-spin" style={{animationDuration: '10s'}}></div>
                <div className="absolute inset-4 border-2 border-white/20 rounded-full animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
              </div>
              
              {/* Pulse effect */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white/30 rounded-full animate-ping"></div>
            </div>
            
            {/* Título com efeito de texto */}
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-4 relative">
                <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent animate-pulse">
                  FaceRec
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-20 blur animate-pulse"></div>
              </h1>
              
              <div className="flex justify-center items-center space-x-2 mb-6">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-white to-transparent flex-1 max-w-12"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <div className="h-0.5 bg-gradient-to-r from-transparent via-white to-transparent flex-1 max-w-12"></div>
              </div>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                <span className="font-light">Sistema inteligente de</span><br/>
                <span className="font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  reconhecimento facial
                </span><br/>
                <span className="font-light">com tecnologia de ponta</span>
              </p>
            </div>
            
            {/* Features com animações */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 group">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-cyan-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 21H5V3H13V9H19V21ZM12 12C10.34 12 9 13.34 9 15C9 16.66 10.34 18 12 18C13.66 18 15 16.66 15 15C15 13.34 13.66 12 12 12Z"/>
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-lg">Precisão 95%</div>
                  <div className="text-blue-200 text-sm">Reconhecimento instantâneo</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 group">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-pink-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs font-bold">🔒</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-lg">100% Seguro</div>
                  <div className="text-purple-200 text-sm">Criptografia avançada</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 group">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-emerald-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4S13.1 6 12 6 10 5.1 10 4 10.9 2 12 2M8.5 8.5C9.6 8.5 10.5 9.4 10.5 10.5S9.6 12.5 8.5 12.5 6.5 11.6 6.5 10.5 7.4 8.5 8.5 8.5M15.5 8.5C16.6 8.5 17.5 9.4 17.5 10.5S16.6 12.5 15.5 12.5 13.5 11.6 13.5 10.5 14.4 8.5 15.5 8.5M12 11C13.1 11 14 11.9 14 13S13.1 15 12 15 10 14.1 10 13 10.9 11 12 11M6 15.5C7.1 15.5 8 16.4 8 17.5S7.1 19.5 6 19.5 4 18.6 4 17.5 4.9 15.5 6 15.5M18 15.5C19.1 15.5 20 16.4 20 17.5S19.1 19.5 18 19.5 16 18.6 16 17.5 16.9 15.5 18 15.5M12 18C13.1 18 14 18.9 14 20S13.1 22 12 22 10 21.1 10 20 10.9 18 12 18M12 6.5L8.5 8.5M12 6.5L15.5 8.5M8.5 12.5L12 11M15.5 12.5L12 11M12 15L6 15.5M12 15L18 15.5M12 18L6 19.5M12 18L18 19.5"/>
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs font-bold">⚡</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-lg">IA Avançada</div>
                  <div className="text-emerald-200 text-sm">Aprendizado contínuo</div>
                </div>
              </div>
            </div>

            {/* Call to action com animação */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="relative">
                <div className="text-blue-200 text-sm font-medium mb-4">
                  Junte-se a mais de <span className="text-yellow-300 font-bold">10.000+</span> usuários
                </div>
                <div className="flex justify-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-xs">👥</span>
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-bounce" style={{animationDelay: '0.2s'}}>
                    <span className="text-xs">🏢</span>
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-bounce" style={{animationDelay: '0.4s'}}>
                    <span className="text-xs">🎓</span>
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-bounce" style={{animationDelay: '0.6s'}}>
                    <span className="text-xs">🏥</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="w-full lg:w-1/2 bg-white/95 backdrop-blur-md rounded-3xl lg:rounded-l-none lg:rounded-r-3xl p-8 lg:p-12 shadow-2xl border border-white/20">
          {/* Header do formulário */}
          <div className="text-center mb-8">
            <div className="lg:hidden w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/facerec-logo.png" 
                alt="FaceRec Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Bem-vindo de volta!
            </h2>
            <p className="text-gray-600">
              Entre na sua conta para continuar
            </p>
          </div>

          {/* Botão Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 rounded-xl px-6 py-4 text-gray-700 font-semibold hover:bg-gray-50 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuar com Google</span>
            {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2"></div>}
          </button>

          {/* Divisor */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="px-4 text-sm text-gray-500 bg-white rounded-full border border-gray-200">
              ou entre com email
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleEmailLogin} className="space-y-6">
            {/* Campo Email */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                  placeholder="Digite seu email"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <span className="text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    📧
                  </span>
                </div>
              </div>
            </div>

            {/* Campo Senha */}
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar</span>
                    <span className="transform transition-transform group-hover:translate-x-1">→</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Link para cadastro */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span>Não tem uma conta?</span>
              <Link
                to="/cadastro"
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors hover:underline"
              >
                Criar conta
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Ao continuar, você concorda com nossos{" "}
              <a href="#" className="text-blue-600 hover:underline">Termos de Uso</a> e{" "}
              <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>
            </p>
          </div>
        </div>
      </div>

      {/* Efeito de brilho no canto */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/30 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
}