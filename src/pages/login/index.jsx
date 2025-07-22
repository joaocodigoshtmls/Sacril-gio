import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider, signInWithPopup } from "../../firebase";

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Usuário logado com Google:", result.user);
      navigate("/home");
    } catch (error) {
      console.error("Erro no login com Google:", error);
    }
  };

  const handleEmailLogin = () => {
    console.log("Login com email/senha realizado!");
    navigate("/home");
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Imagem do lado esquerdo */}
        <div
          className="hidden lg:block lg:w-1/2 bg-cover"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1606660265514-358ebbadc80d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1575&q=80')",
          }}
        ></div>

        {/* Formulário */}
        <div className="w-full lg:w-1/2 p-8">
          <div className="flex justify-center mb-4">
            <img
              className="w-auto h-8"
              src="https://merakiui.com/images/logo.svg"
              alt="Logo"
            />
          </div>

          <p className="text-xl text-center text-gray-600 font-medium">
            Welcome back!
          </p>

          {/* Botão Google */}
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center mt-6 w-full text-blue-600 border border-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            <svg className="w-6 h-6 mr-2" viewBox="0 0 40 40">
              {/* Google icon paths aqui */}
            </svg>
            Sign in with Google
          </button>

          <div className="flex items-center justify-between mt-6">
            <span className="w-1/5 border-b"></span>
            <span className="text-xs text-gray-500 uppercase">
              or login with email
            </span>
            <span className="w-1/5 border-b"></span>
          </div>

          {/* Inputs */}
          <div className="mt-4">
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mt-4">
            <div className="flex justify-between">
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Password
              </label>
              <a href="#" className="text-xs text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Botão Sign In */}
          <button
            onClick={handleEmailLogin}
            className="w-full mt-6 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </button>

          {/* Link para cadastro */}
          <div className="flex items-center justify-between mt-6">
            <span className="w-1/5 border-b"></span>
            <Link
              to="/cadastro"
              className="text-xs text-blue-600 uppercase hover:underline"
            >
              Sign Up
            </Link>
            <span className="w-1/5 border-b"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
