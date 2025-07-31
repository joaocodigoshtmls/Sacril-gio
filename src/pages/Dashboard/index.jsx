import React from "react";

export default function Alunos() {
  const alunos = [
    { id: 1, nome: "João Silva", matricula: "2021001", curso: "Engenharia Mecânica" },
    { id: 2, nome: "Maria Oliveira", matricula: "2021002", curso: "Ciência da Computação" },
    { id: 3, nome: "Carlos Souza", matricula: "2021003", curso: "Engenharia Elétrica" },
    { id: 4, nome: "Ana Lima", matricula: "2021004", curso: "Sistemas de Informação" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Lista de Alunos</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Nome</th>
              <th className="py-2 px-4 border-b">Matrícula</th>
              <th className="py-2 px-4 border-b">Curso</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => (
              <tr key={aluno.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b text-center">{aluno.id}</td>
                <td className="py-2 px-4 border-b">{aluno.nome}</td>
                <td className="py-2 px-4 border-b">{aluno.matricula}</td>
                <td className="py-2 px-4 border-b">{aluno.curso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
