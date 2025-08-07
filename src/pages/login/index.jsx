import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider, signInWithPopup } from "../../firebase";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = async () => {
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
    }
  };

  const handleEmailLogin = async (e) => {
  e.preventDefault();
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
  }
};


  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div
          className="hidden lg:block lg:w-1/2 bg-cover"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1606660265514-358ebbadc80d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1575&q=80')",
          }}
        />

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

          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center mt-6 w-full text-blue-600 border border-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Sign in with Google
          </button>

          <div className="flex items-center justify-between mt-6">
            <span className="w-1/5 border-b"></span>
            <span className="text-xs text-gray-500 uppercase">
              or login with email
            </span>
            <span className="w-1/5 border-b"></span>
          </div>

          <form onSubmit={handleEmailLogin} className="mt-4 space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 text-black bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          </form>

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
}
