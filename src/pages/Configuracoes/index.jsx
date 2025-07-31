import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

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
      }
    });

    return () => unsubscribe(); // Limpeza do listener
  }, []);

  const handleSair = () => {
    navigate("/login");
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-2xl bg-white shadow-md rounded p-6 mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-4xl font-bold text-gray-800">Minha Conta</h2>
          <button
            onClick={handleSair}
            className="bg-gray-100 px-4 py-1 rounded text-gray-500 hover:text-red-500 transition"
          >
            Sair
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded w-full flex flex-col gap-4">
          {Object.keys(usuario).map((campo) => (
            <div className="flex items-center gap-2" key={campo}>
              <input
                type="text"
                value={usuario[campo]}
                disabled={!camposEditaveis[campo]}
                onChange={(e) =>
                  setUsuario({ ...usuario, [campo]: e.target.value })
                }
                className="border rounded px-4 py-2 flex-1"
              />
              <button
                onClick={() =>
                  setCamposEditaveis({
                    ...camposEditaveis,
                    [campo]: true,
                  })
                }
              >
                ✏️
              </button>
            </div>
          ))}

          <button
            onClick={async () => {
              try {
                if (auth.currentUser) {
                  await auth.currentUser.updateProfile({
                    displayName: usuario.nome,
                  });

                  if (usuario.email !== auth.currentUser.email) {
                    await auth.currentUser.updateEmail(usuario.email);
                  }

                  alert("Dados atualizados com sucesso!");
                }
              } catch (error) {
                alert("Erro ao atualizar dados: " + error.message);
              }
            }}
            className="bg-blue-500 text-black py-2 px-6 rounded w-fit mt-4"
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}
