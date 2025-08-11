import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Cadastro() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form
  
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    return formData.fullName.length >= 2 && formData.email && formData.phone;
  };

  const validateStep2 = () => {
    return formData.password.length >= 6 && formData.password === formData.confirmPassword;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) {
      alert("Verifique se as senhas coincidem e têm pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Erro no cadastro");
      
      // Sucesso - redireciona para login
      navigate("/login", { 
        state: { message: "Conta criada com sucesso! Faça login para continuar." }
      });
      
    } catch (err) {
      console.error("Erro no cadastro:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden">
      {/* Background com gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-bl from-indigo-900 via-purple-900 to-pink-900">
        {/* Efeito de partículas flutuantes */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className={`absolute bg-white rounded-full animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${Math.random() * 3 + 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Container principal */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-6xl mx-4">
        {/* Lado esquerdo - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-white/10 backdrop-blur-md rounded-l-3xl p-12 flex-col justify-center items-center text-white border border-white/20">
          <div className="text-center">
            {/* Logo */}
            <div className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center shadow-2xl animate-pulse overflow-hidden">
              <img 
                src="/facerec-logo.png" 
                alt="FaceRec Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Junte-se ao FaceRec
            </h1>
            
            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              Crie sua conta e tenha acesso ao futuro da tecnologia de reconhecimento facial
            </p>
            
            {/* Features */}
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-green-300 text-sm">✓</span>
                </div>
                <span className="text-purple-100">Reconhecimento 95% preciso</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-300 text-sm">✓</span>
                </div>
                <span className="text-purple-100">Segurança de dados avançada</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <span className="text-indigo-300 text-sm">✓</span>
                </div>
                <span className="text-purple-100">Interface intuitiva e moderna</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="w-full lg:w-1/2 bg-white/95 backdrop-blur-md rounded-3xl lg:rounded-l-none lg:rounded-r-3xl p-8 lg:p-12 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="lg:hidden w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/facerec-logo.png" 
                alt="FaceRec Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Criar Nova Conta
            </h2>
            <p className="text-gray-600">
              Preencha os dados para começar sua jornada
            </p>

            {/* Progress indicator */}
            <div className="flex justify-center mt-6 space-x-2">
              <div className={`w-8 h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Etapa {step} de 2
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1 - Dados pessoais */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Nome completo */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                      placeholder="Digite seu nome completo"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <span className="text-gray-400 group-focus-within:text-purple-500 transition-colors">
                        👤
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                      placeholder="Digite seu email"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <span className="text-gray-400 group-focus-within:text-purple-500 transition-colors">
                        📧
                      </span>
                    </div>
                  </div>
                </div>

                {/* Telefone */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                      placeholder="(11) 99999-9999"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <span className="text-gray-400 group-focus-within:text-purple-500 transition-colors">
                        📱
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botão próximo */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!validateStep1()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Continuar</span>
                    <span className="transform transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </button>
              </div>
            )}

            {/* Step 2 - Senha */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Senha */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                      placeholder="Mínimo 6 caracteres"
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
                  <div className="mt-2 flex space-x-2">
                    <div className={`h-1 flex-1 rounded ${formData.password.length >= 6 ? 'bg-green-400' : 'bg-gray-200'} transition-colors`}></div>
                    <div className={`h-1 flex-1 rounded ${formData.password.length >= 8 ? 'bg-green-400' : 'bg-gray-200'} transition-colors`}></div>
                    <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(formData.password) ? 'bg-green-400' : 'bg-gray-200'} transition-colors`}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Força da senha: {formData.password.length >= 8 && /[A-Z]/.test(formData.password) ? 'Forte' : formData.password.length >= 6 ? 'Média' : 'Fraca'}</p>
                </div>

                {/* Confirmar senha */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-purple-500'
                      }`}
                      placeholder="Confirme sua senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-red-500 text-sm mt-2">As senhas não coincidem</p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-green-500 text-sm mt-2">✓ Senhas coincidem</p>
                  )}
                </div>

                {/* Botões */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-300 transition-all duration-300"
                  >
                    ← Voltar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || !validateStep2()}
                    className="flex-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Criando conta...</span>
                        </>
                      ) : (
                        <>
                          <span>Criar Conta</span>
                          <span>🚀</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Link para login */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span>Já tem uma conta?</span>
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-800 font-semibold transition-colors hover:underline"
              >
                Fazer login
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Ao criar uma conta, você concorda com nossos{" "}
              <a href="#" className="text-purple-600 hover:underline">Termos de Uso</a> e{" "}
              <a href="#" className="text-purple-600 hover:underline">Política de Privacidade</a>
            </p>
          </div>
        </div>
      </div>

      {/* Efeitos de brilho */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-400/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-400/30 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
}