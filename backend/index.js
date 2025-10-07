const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Plan = require('./models/Plan');
const auth = require('./middleware/auth');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Simple request logger (debug)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const GEMINI_API_KEY = 'AIzaSyB1yUMnS8qrt42DahGdgEfzYZhh9kPT24g';
const GEMINI_MODEL = 'gemini-2.5-flash';

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || '';
if (!MONGO_URI) {
  console.warn('MONGO_URI environment variable is not set. Please configure .env');
}
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

app.post('/api/travel', async (req, res) => {
  const { queryText } = req.body;
  if (!queryText) return res.status(400).json({ error: 'queryText boş olamaz' });

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      { contents: [{ parts: [{ text: queryText }] }] },
      { headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_API_KEY } }
    );

    const candidate = response.data.candidates?.[0];
    const plan = candidate?.content?.parts[0].text || '';
    res.json({ plan });

  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'API çağrısı başarısız' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// List registered routes for debugging
app.get('/api/_routes', (req, res) => {
  try {
    const routes = [];
    app._router.stack.forEach((m) => {
      if (m.route && m.route.path) {
        const methods = Object.keys(m.route.methods).filter(Boolean);
        routes.push({ methods, path: m.route.path });
      } else if (m.name === 'router' && m.handle && m.handle.stack) {
        m.handle.stack.forEach((h) => {
          if (h.route && h.route.path) {
            const methods = Object.keys(h.route.methods).filter(Boolean);
            routes.push({ methods, path: h.route.path });
          }
        });
      }
    });
    res.json({ routes });
  } catch (e) {
    res.status(500).json({ error: 'routes_error', details: String(e) });
  }
});

// ===== Auth Endpoints (MongoDB + JWT) =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email ve password gereklidir' });
    }
    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Bu email ile kayıt zaten mevcut' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    console.error('Register error:', e);
    return res.status(500).json({ error: 'Kayıt başarısız' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email ve password gereklidir' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Email veya şifre hatalı' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Email veya şifre hatalı' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Giriş başarısız' });
  }
});

// ===== Plans Endpoints (MongoDB, require auth) =====
app.get('/api/plans', auth, async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ plans });
  } catch (e) {
    console.error('Get plans error:', e);
    return res.status(500).json({ error: 'Planlar getirilemedi' });
  }
});

app.post('/api/plans', auth, async (req, res) => {
  try {
    const { title, query, plan } = req.body || {};
    if (!title || !query || !plan) {
      return res.status(400).json({ error: 'title, query ve plan gereklidir' });
    }
    const created = await Plan.create({ userId: req.user.id, title, query, plan, isFavorite: false });
    return res.status(201).json({ plan: created });
  } catch (e) {
    console.error('Create plan error:', e);
    return res.status(500).json({ error: 'Plan kaydedilemedi' });
  }
});

app.delete('/api/plans/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Plan.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: 'Plan bulunamadı' });
    return res.json({ message: 'Silindi' });
  } catch (e) {
    console.error('Delete plan error:', e);
    return res.status(500).json({ error: 'Plan silinemedi' });
  }
});

app.patch('/api/plans/:id/favorite', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findOne({ _id: id, userId: req.user.id });
    if (!plan) return res.status(404).json({ error: 'Plan bulunamadı' });
    plan.isFavorite = !plan.isFavorite;
    await plan.save();
    return res.json({ message: plan.isFavorite ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı', plan });
  } catch (e) {
    console.error('Favorite toggle error:', e);
    return res.status(500).json({ error: 'İşlem başarısız' });
  }
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001'));
