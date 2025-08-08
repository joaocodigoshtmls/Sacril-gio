// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

/* ===== CORS (habilita front em Vite) ===== */
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.options('*', cors());

/* ===== Body parser ===== */
app.use(express.json());

/* ===== Porta ===== */
const PORT = process.env.PORT || 3001;

/* ===== Fallback de JWT_SECRET em dev ===== */
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET não definido no .env — usando valor TEMPORÁRIO (apenas dev).');
  process.env.JWT_SECRET = 'dev-temp-secret-change-me';
}

/* ===== Middleware de autenticação JWT ===== */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token de acesso requerido' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Erro no token:', err);
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

/* ===== Rotas de teste ===== */
app.get('/', (req, res) => {
  res.send('API funcionando!');
});

app.get('/test', (req, res) => {
  res.json({
    message: 'Server funcionando!',
    timestamp: new Date(),
    port: PORT
  });
});

/* Saúde da API (para checar no navegador) */
app.get('/health', (req, res) => {
  res.json({ ok: true, ts: new Date(), port: PORT });
});

/* ===== Signup ===== */
app.post('/signup', async (req, res) => {
  const { fullName, email, password, phone } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO users (full_name, email, password_hash, phone)
       VALUES (?, ?, ?, ?)`,
      [fullName, email, hash, phone]
    );
    res.status(201).json({ userId: result.insertId });
  } catch (err) {
    console.error('Erro no cadastro:', err);
    res.status(400).json({ error: 'Falha no cadastro: ' + err.message });
  }
});

/* ===== Login ===== */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.execute(
      `SELECT id, password_hash FROM users WHERE email = ?`,
      [email]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    console.log('Login realizado para usuário ID:', user.id);
    res.json({ token });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro no login: ' + err.message });
  }
});

/* ===== Sync Firebase → MariaDB ===== */
app.post('/api/sync-firebase-user', async (req, res) => {
  const { firebaseEmail, firebaseDisplayName, firebaseUid } = req.body;

  try {
    console.log('🔄 Sincronizando usuário do Firebase:', firebaseEmail);

    const [existingUsers] = await pool.execute(
      `SELECT id, full_name, email FROM users WHERE email = ?`,
      [firebaseEmail]
    );

    let userId;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log('✅ Usuário já existe no MariaDB, ID:', userId);

      if (firebaseDisplayName && existingUsers[0].full_name !== firebaseDisplayName) {
        await pool.execute(
          `UPDATE users SET full_name = ?, updated_at = NOW() WHERE id = ?`,
          [firebaseDisplayName, userId]
        );
        console.log('📝 Nome atualizado no MariaDB');
      }
    } else {
      console.log('➕ Criando novo usuário no MariaDB...');
      const [result] = await pool.execute(
        `INSERT INTO users (full_name, email, password_hash, firebase_uid, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [
          firebaseDisplayName || 'Usuário Firebase',
          firebaseEmail,
          'firebase_auth',
          firebaseUid
        ]
      );
      userId = result.insertId;
      console.log('✅ Novo usuário criado no MariaDB, ID:', userId);
    }

    const token = jwt.sign(
      { sub: userId, email: firebaseEmail, firebase: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('🎫 Token JWT gerado para usuário ID:', userId);

    res.json({
      success: true,
      token,
      userId,
      message: 'Usuário sincronizado com sucesso'
    });

  } catch (err) {
    console.error('❌ Erro ao sincronizar usuário:', err);
    res.status(500).json({ error: 'Erro ao sincronizar usuário: ' + err.message });
  }
});

/* ===== Perfil do usuário ===== */
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Buscando perfil para usuário ID:', req.user.sub);

    const [rows] = await pool.execute(
      `SELECT id, full_name, email, phone, cpf, created_at, updated_at 
       FROM users WHERE id = ?`,
      [req.user.sub]
    );

    if (rows.length === 0) {
      console.log('Usuário não encontrado no banco:', req.user.sub);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = rows[0];
    console.log('Perfil encontrado:', user);
    res.json(user);
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/* ===== Atualizar perfil ===== */
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  const { full_name, phone, cpf } = req.body;

  try {
    console.log('Atualizando perfil para usuário ID:', req.user.sub);
    console.log('Novos dados:', { full_name, phone, cpf });

    if (!full_name || full_name.trim().length < 2) {
      return res.status(400).json({ error: 'Nome deve ter pelo menos 2 caracteres' });
    }

    const [result] = await pool.execute(
      `UPDATE users 
       SET full_name = ?, phone = ?, cpf = ?, updated_at = NOW()
       WHERE id = ?`,
      [full_name.trim(), phone || null, cpf || null, req.user.sub]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const [rows] = await pool.execute(
      `SELECT id, full_name, email, phone, cpf, updated_at 
       FROM users WHERE id = ?`,
      [req.user.sub]
    );

    console.log('Perfil atualizado com sucesso');
    res.json({
      message: 'Perfil atualizado com sucesso',
      user: rows[0]
    });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/* ===== Alterar senha ===== */
app.put('/api/user/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    console.log('Alterando senha para usuário ID:', req.user.sub);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    const [rows] = await pool.execute(
      `SELECT password_hash FROM users WHERE id = ?`,
      [req.user.sub]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) return res.status(401).json({ error: 'Senha atual incorreta' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`,
      [newHash, req.user.sub]
    );

    console.log('Senha alterada com sucesso');
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error('Erro ao alterar senha:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/* ===== Excluir conta ===== */
app.delete('/api/user/account', authenticateToken, async (req, res) => {
  const { password } = req.body;

  try {
    console.log('Excluindo conta para usuário ID:', req.user.sub);

    if (!password) return res.status(400).json({ error: 'Senha é obrigatória para excluir a conta' });

    const [rows] = await pool.execute(
      `SELECT password_hash FROM users WHERE id = ?`,
      [req.user.sub]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) return res.status(401).json({ error: 'Senha incorreta' });

    await pool.execute(`DELETE FROM users WHERE id = ?`, [req.user.sub]);

    console.log('Conta excluída com sucesso');
    res.json({ message: 'Conta excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir conta:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/* ===== Middlewares de erro e 404 ===== */
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.use((req, res) => {
  console.log('Rota não encontrada:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Rota não encontrada' });
});

/* ===== Sobe o servidor + ping no DB ===== */
app.listen(PORT, async () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
  console.log('📅 Iniciado em:', new Date().toLocaleString('pt-BR'));

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT 1 as ok');
    conn.release();
    if (rows?.[0]?.ok === 1) {
      console.log('✅ Conectado ao banco de dados com sucesso');
    } else {
      console.warn('⚠️  Banco respondeu, mas sem OK esperado');
    }
  } catch (err) {
    console.error('❌ Falha ao conectar no banco:', err.message);
    console.error('Verifique DB_HOST/DB_USER/DB_PASS/DB_NAME no .env');
  }
});

/* ===== Tratamento global de erros não capturados ===== */
process.on('uncaughtException', (err) => {
  console.error('Erro não capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Promise rejeitada não tratada:', err);
  process.exit(1);
});
