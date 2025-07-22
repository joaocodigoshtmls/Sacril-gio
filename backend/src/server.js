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
app.use(express.json()); // body-parser

const PORT = process.env.PORT || 3001;

// --- ROTA DE TESTE ---
app.get('/', (req, res) => {
  res.send('API funcionando!');
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
    console.error(err);
    res.status(400).json({ error: 'Falha no cadastro' });
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
    if (rows.length === 0) return res.status(401).json({ error: 'User não encontrado' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login' });
  }
});

// --- INICIA ---
app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});
