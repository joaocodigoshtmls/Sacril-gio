// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// --- MIDDLEWARE PARA VERIFICAR TOKEN ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Erro no token:', err);
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// --- ROTA DE TESTE BÁSICA ---
app.get('/', (req, res) => {
  res.send('API funcionando!');
});

// --- ROTA DE TESTE SIMPLES ---
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server funcionando!', 
    timestamp: new Date(),
    port: PORT 
  });
});

// --- ROTA DE TESTE COM AUTENTICAÇÃO ---
app.get('/api/test-auth', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Token válido!', 
    userId: req.user.sub,
    timestamp: new Date() 
  });
});

// --- CADASTRO ---
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

// --- LOGIN ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.execute(
      `SELECT id, password_hash FROM users WHERE email = ?`,
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

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

// --- SINCRONIZAR USUÁRIO DO FIREBASE COM MARIADB ---
app.post('/api/sync-firebase-user', async (req, res) => {
  const { firebaseEmail, firebaseDisplayName, firebaseUid } = req.body;
  
  try {
    console.log('🔄 Sincronizando usuário do Firebase:', firebaseEmail);
    
    // Verifica se usuário já existe no MariaDB
    const [existingUsers] = await pool.execute(
      `SELECT id, full_name, email FROM users WHERE email = ?`,
      [firebaseEmail]
    );

    let userId;
    
    if (existingUsers.length > 0) {
      // Usuário já existe, pega o ID
      userId = existingUsers[0].id;
      console.log('✅ Usuário já existe no MariaDB, ID:', userId);
      
      // Atualiza o nome se necessário
      if (firebaseDisplayName && existingUsers[0].full_name !== firebaseDisplayName) {
        await pool.execute(
          `UPDATE users SET full_name = ?, updated_at = NOW() WHERE id = ?`,
          [firebaseDisplayName, userId]
        );
        console.log('📝 Nome atualizado no MariaDB');
      }
    } else {
      // Usuário não existe, cria um novo registro
      console.log('➕ Criando novo usuário no MariaDB...');
      
      const [result] = await pool.execute(
        `INSERT INTO users (full_name, email, password_hash, firebase_uid, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [
          firebaseDisplayName || 'Usuário Firebase',
          firebaseEmail,
          'firebase_auth', // Password placeholder para usuários do Firebase
          firebaseUid
        ]
      );
      
      userId = result.insertId;
      console.log('✅ Novo usuário criado no MariaDB, ID:', userId);
    }

    // Gera token JWT para este usuário
    const token = jwt.sign(
      { sub: userId, email: firebaseEmail, firebase: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('🎫 Token JWT gerado para usuário ID:', userId);

    res.json({
      success: true,
      token: token,
      userId: userId,
      message: 'Usuário sincronizado com sucesso'
    });

  } catch (err) {
    console.error('❌ Erro ao sincronizar usuário:', err);
    res.status(500).json({ error: 'Erro ao sincronizar usuário: ' + err.message });
  }
});

// --- BUSCAR DADOS DO USUÁRIO ---
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

// --- ATUALIZAR DADOS DO USUÁRIO ---
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  const { full_name, phone, cpf } = req.body;
  
  try {
    console.log('Atualizando perfil para usuário ID:', req.user.sub);
    console.log('Novos dados:', { full_name, phone, cpf });
    
    // Validações básicas
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

    // Buscar dados atualizados
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

// --- ALTERAR SENHA ---
app.put('/api/user/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    console.log('Alterando senha para usuário ID:', req.user.sub);
    
    // Validações
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    // Verificar senha atual
    const [rows] = await pool.execute(
      `SELECT password_hash FROM users WHERE id = ?`,
      [req.user.sub]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Atualizar senha
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

// --- EXCLUIR CONTA ---
app.delete('/api/user/account', authenticateToken, async (req, res) => {
  const { password } = req.body;
  
  try {
    console.log('Excluindo conta para usuário ID:', req.user.sub);
    
    if (!password) {
      return res.status(400).json({ error: 'Senha é obrigatória para excluir a conta' });
    }

    // Verificar senha
    const [rows] = await pool.execute(
      `SELECT password_hash FROM users WHERE id = ?`,
      [req.user.sub]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Excluir usuário
    await pool.execute(`DELETE FROM users WHERE id = ?`, [req.user.sub]);

    console.log('Conta excluída com sucesso');
    res.json({ message: 'Conta excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir conta:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// --- MIDDLEWARE DE ERRO GLOBAL ---
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// --- MIDDLEWARE PARA ROTAS NÃO ENCONTRADAS ---
app.use((req, res) => {
  console.log('Rota não encontrada:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Rota não encontrada' });
});

// --- INICIA O SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
  console.log('📅 Iniciado em:', new Date().toLocaleString('pt-BR'));
});

// --- TRATAMENTO DE ERROS NÃO CAPTURADOS ---
process.on('uncaughtException', (err) => {
  console.error('Erro não capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Promise rejeitada não tratada:', err);
  process.exit(1);
});