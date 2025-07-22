import React from 'react';
import { Link } from 'react-router-dom';

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-6">FaceRec</h1>
        <nav className="flex flex-col space-y-4">
          <Link to="/home" className="hover:text-gray-300">🏠 Home</Link>
          <Link to="/dashboard" className="hover:text-gray-300">📊 Dashboard</Link>
          <Link to="/alunos" className="hover:text-gray-300">📋 Lista de Alunos</Link>
          <Link to="/configuracoes" className="hover:text-gray-300">⚙️ Configurações</Link>
        </nav>
      </div>

      {/* Área onde aparece o conteúdo da página */}
      <div className="flex-1 bg-gray-50 p-6">
        {children}
      </div>
    </div>
  );
}
