# FaceRec CFTV Web

Sistema web de monitoramento CFTV com reconhecimento facial simulado, gravação local e integração com câmeras ESP32 e streams HLS.

## 🚀 Funcionalidades

- 📹 Monitoramento ao vivo com múltiplas fontes:
  - Câmeras ESP32 (MJPEG/Snapshot)
  - Streams HLS públicos com áudio
- 🎥 Gravação local com filtros visuais
- 📸 Captura de fotos
- 🎨 Ajustes em tempo real:
  - Brilho, Contraste, Saturação, Zoom
- 🔐 Autenticação via Firebase
- 🌐 Proxy robusto para streams HLS

## 🛠️ Tecnologias

- **Frontend:**
  - React + Vite
  - TypeScript
  - Tailwind CSS
  - HLS.js para streams
  - Framer Motion para animações

- **Backend:**
  - Node.js
  - Express
  - CORS habilitado
  - Proxy para ESP32 e HLS

## 📋 Pré-requisitos

- Node.js 22+
- NPM ou Yarn
- Câmera ESP32 (opcional)

## 🔧 Instalação

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/joaocodigoshtmls/FaceRec.git
cd FaceRec
\`\`\`

2. Instale as dependências do frontend:
\`\`\`bash
npm install
\`\`\`

3. Configure o backend mock:
\`\`\`bash
cd mock-cam
npm install
\`\`\`

4. Configure os arquivos de ambiente:

Frontend (.env.local):
\`\`\`env
VITE_CAM_BASE=http://localhost:3000
VITE_API_BASE=
\`\`\`

Backend (mock-cam/.env):
\`\`\`env
PORT=3000
ESP32_BASE=http://192.168.0.xxx
ESP32_STREAM=:81/stream
ESP32_SNAPSHOT=/capture
\`\`\`

## 🚀 Executando

1. Inicie o backend mock:
\`\`\`bash
cd mock-cam
npm start
\`\`\`

2. Em outro terminal, inicie o frontend:
\`\`\`bash
cd ..  # volte para a raiz do projeto
npm run dev
\`\`\`

3. Acesse http://localhost:5173/monitoramento

## 📚 Scripts Disponíveis

- \`npm run dev\`: Inicia o ambiente de desenvolvimento
- \`npm run build\`: Gera build de produção
- \`npm run preview\`: Visualiza build local
- \`npm run lint\`: Executa verificação de código

## 🔍 Estrutura do Projeto

\`\`\`
├── src/
│   ├── Components/     # Componentes React
│   ├── Layout/        # Layouts da aplicação
│   ├── pages/         # Páginas da aplicação
│   ├── assets/        # Recursos estáticos
│   ├── stores/        # Gerenciamento de estado
│   └── types/         # Definições TypeScript
├── mock-cam/          # Backend mock/proxy
├── lib/              # Bibliotecas compartilhadas
└── public/           # Arquivos públicos
\`\`\`

## 🤝 Contribuindo

1. Faça o fork do projeto
2. Crie sua branch de feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📝 Limitações Conhecidas

- Reconhecimento facial é simulado
- Armazenamento de gravações é local/temporário
- Autenticação básica via Firebase

## 🔮 Próximos Passos

- [ ] Integração com modelo real de reconhecimento facial
- [ ] Sistema de armazenamento persistente para gravações
- [ ] Sincronização com MariaDB
- [ ] Deploy com HTTPS e proxy reverso

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
