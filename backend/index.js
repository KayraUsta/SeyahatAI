const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { connectToDatabase } = require('./config/database');
const User = require('./models/mssql/User');
const Plan = require('./models/mssql/Plan');
const Budget = require('./models/mssql/Budget');
const TodoList = require('./models/mssql/TodoList');
const PasswordReset = require('./models/mssql/PasswordReset');
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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyB1yUMnS8qrt42DahGdgEfzYZhh9kPT24g';
const GEMINI_MODEL = 'gemini-2.5-flash';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';

// Email Configuration
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Yola Çık AI <noreply@yolacik.com>';

// Create email transporter
let emailTransporter = null;

// Initialize email transporter
async function initializeEmailTransporter() {
  if (EMAIL_SERVICE.toLowerCase() === 'ethereal') {
    // Create Ethereal test account automatically
    try {
      const testAccount = await nodemailer.createTestAccount();
      emailTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('✅ Ethereal test email account created');
      console.log('📧 Test emails will be available at: https://ethereal.email');
      console.log(`   Username: ${testAccount.user}`);
      return;
    } catch (error) {
      console.error('Ethereal account creation failed:', error.message);
    }
  }
  
  if (EMAIL_USER && EMAIL_PASSWORD) {
    emailTransporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
      },
      // For Gmail without app password (less secure)
      tls: {
        rejectUnauthorized: false
      }
    });
    console.log('✅ Email service configured successfully');
  } else {
    console.warn('⚠️  Email credentials not configured. Password reset codes will be logged to console only.');
  }
}

// Initialize email on startup
initializeEmailTransporter().catch(err => {
  console.error('Email initialization error:', err);
});

// MSSQL Connection
async function initializeDatabase() {
  try {
    await connectToDatabase();
    console.log('✅ MSSQL Server connected successfully');
  } catch (err) {
    console.error('❌ MSSQL connection error:', err.message);
    console.warn('⚠️  Database connection failed. Some features may not work properly.');
  }
}

// Initialize database on startup
initializeDatabase();

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
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper: Normalize city name (Türkçe karakterleri düzelt)
function normalizeCity(city) {
  const map = {
    'İ': 'I', 'ı': 'i', 'Ğ': 'G', 'ğ': 'g',
    'Ü': 'U', 'ü': 'u', 'Ş': 'S', 'ş': 's',
    'Ö': 'O', 'ö': 'o', 'Ç': 'C', 'ç': 'c'
  };
  return city.split('').map(char => map[char] || char).join('');
}

// Weather API - Current weather
app.get('/api/weather/current/:city', async (req, res) => {
  try {
    let { city } = req.params;
    if (!WEATHER_API_KEY) {
      return res.status(500).json({ error: 'Weather API key yapılandırılmamış' });
    }
    city = normalizeCity(decodeURIComponent(city));
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: WEATHER_API_KEY, units: 'metric', lang: 'tr' }
    });
    const data = response.data;
    res.json({
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed),
      description: data.weather[0].description,
      icon: data.weather[0].icon
    });
  } catch (err) {
    console.error('Weather API error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.status === 404 ? 'Şehir bulunamadı' : 'Hava durumu bilgisi alınamadı' });
  }
});

// Weather API - 5 day forecast
app.get('/api/weather/:city', async (req, res) => {
  try {
    let { city } = req.params;
    const { days = 5 } = req.query;
    if (!WEATHER_API_KEY) {
      return res.status(500).json({ error: 'Weather API key yapılandırılmamış' });
    }
    city = normalizeCity(decodeURIComponent(city));
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: { q: city, appid: WEATHER_API_KEY, units: 'metric', lang: 'tr', cnt: Math.min(days * 8, 40) }
    });
    const forecast = response.data;
    const dailyData = {};
    forecast.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = { temps: [], description: item.weather[0].description, icon: item.weather[0].icon };
      }
      dailyData[date].temps.push(item.main.temp);
    });
    const daily = Object.entries(dailyData).map(([date, data]) => ({
      date,
      temp_min: Math.round(Math.min(...data.temps)),
      temp_max: Math.round(Math.max(...data.temps)),
      description: data.description,
      icon: data.icon
    }));
    res.json({ city: forecast.city.name, country: forecast.city.country, daily: daily.slice(0, days) });
  } catch (err) {
    console.error('Weather API error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.status === 404 ? 'Şehir bulunamadı' : 'Hava durumu bilgisi alınamadı' });
  }
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
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Bu email ile kayıt zaten mevcut' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
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
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Email veya şifre hatalı' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Email veya şifre hatalı' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Giriş başarısız' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    return res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    console.error('Auth me error:', e);
    return res.status(500).json({ error: 'Kullanıcı bilgileri alınamadı' });
  }
});

// ===== Password Reset Endpoints =====
// Helper function to send password reset email
async function sendPasswordResetEmail(email, name, resetToken) {
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: '🔐 Yola Çık - Şifre Sıfırlama Kodu',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✈️ Yola Çık</h1>
            <p>Şifre Sıfırlama Talebi</p>
          </div>
          <div class="content">
            <p>Merhaba <strong>${name}</strong>,</p>
            <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki 6 haneli kodu kullanarak yeni şifrenizi belirleyebilirsiniz:</p>
            
            <div class="code-box">
              <div class="code">${resetToken}</div>
              <p style="margin: 10px 0 0 0; color: #666;">Doğrulama Kodu</p>
            </div>

            <div class="warning">
              <strong>⚠️ Önemli:</strong>
              <ul style="margin: 10px 0;">
                <li>Bu kod <strong>15 dakika</strong> geçerlidir</li>
                <li>Kodu kimseyle paylaşmayın</li>
                <li>Bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz</li>
              </ul>
            </div>

            <p>Şifrenizi sıfırlamak için uygulamaya dönün ve kodu girin.</p>
            
            <p style="margin-top: 30px;">İyi yolculuklar dileriz! 🌍</p>
            <p><strong>Yola Çık Ekibi</strong></p>
          </div>
          <div class="footer">
            <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
            <p>&copy; 2024 Yola Çık AI. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  if (emailTransporter) {
    const info = await emailTransporter.sendMail(mailOptions);
    
    // If using Ethereal, log preview URL
    if (EMAIL_SERVICE.toLowerCase() === 'ethereal') {
      console.log('📧 Ethereal email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  }
  return false;
}

// Request password reset
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email gereklidir' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Security: Don't reveal if email exists
      return res.json({ message: 'Eğer email kayıtlıysa, şifre sıfırlama kodu gönderildi' });
    }

    // Generate 6-digit reset code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Token expires in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete any existing reset tokens for this user
    await PasswordReset.deleteByUserId(user.id);

    // Create new reset token
    await PasswordReset.create({
      userId: user.id,
      email: user.email,
      resetToken,
      expiresAt
    });

    // Send email
    try {
      const emailSent = await sendPasswordResetEmail(user.email, user.name, resetToken);
      
      if (emailSent) {
        console.log(`✅ Password reset email sent to ${user.email}`);
      } else {
        // Fallback: Log to console if email not configured
        console.log('='.repeat(50));
        console.log(`PASSWORD RESET CODE for ${user.email}: ${resetToken}`);
        console.log(`Expires at: ${expiresAt.toLocaleString('tr-TR')}`);
        console.log('='.repeat(50));
      }
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Continue anyway, log to console
      console.log('='.repeat(50));
      console.log(`PASSWORD RESET CODE for ${user.email}: ${resetToken}`);
      console.log(`Expires at: ${expiresAt.toLocaleString('tr-TR')}`);
      console.log('='.repeat(50));
    }

    return res.json({ 
      message: 'Şifre sıfırlama kodu email adresinize gönderildi',
      // In development, return the code (remove in production)
      devCode: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (e) {
    console.error('Forgot password error:', e);
    return res.status(500).json({ error: 'İşlem başarısız' });
  }
});

// Verify reset code
app.post('/api/auth/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ error: 'Email ve kod gereklidir' });
    }

    const resetRequest = await PasswordReset.findByEmailAndToken(email, code);

    if (!resetRequest) {
      return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş kod' });
    }

    return res.json({ message: 'Kod doğrulandı', valid: true });
  } catch (e) {
    console.error('Verify code error:', e);
    return res.status(500).json({ error: 'Doğrulama başarısız' });
  }
});

// Reset password with code
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body || {};
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, kod ve yeni şifre gereklidir' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });
    }

    const resetRequest = await PasswordReset.findByEmailAndToken(email, code);

    if (!resetRequest) {
      return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş kod' });
    }

    // Update user password
    const user = await User.findById(resetRequest.userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(user.id, hashed);

    // Mark reset token as used
    await PasswordReset.markAsUsed(resetRequest.id);

    return res.json({ message: 'Şifreniz başarıyla değiştirildi' });
  } catch (e) {
    console.error('Reset password error:', e);
    return res.status(500).json({ error: 'Şifre sıfırlama başarısız' });
  }
});

// ===== Plans Endpoints (MSSQL, require auth) =====
app.get('/api/plans', auth, async (req, res) => {
  try {
    const plans = await Plan.findByUserId(req.user.id);
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
    const deleted = await Plan.deleteById(id, req.user.id);
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
    const plan = await Plan.toggleFavorite(id, req.user.id);
    if (!plan) return res.status(404).json({ error: 'Plan bulunamadı' });
    return res.json({ message: plan.isFavorite ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı', plan });
  } catch (e) {
    console.error('Favorite toggle error:', e);
    return res.status(500).json({ error: 'İşlem başarısız' });
  }
});
// ===== Budget Endpoints =====
// Get all budgets
app.get('/api/budgets', auth, async (req, res) => {
  try {
    const budgets = await Budget.findByUserId(req.user.id);
    return res.json({ budgets });
  } catch (e) {
    console.error('Get budgets error:', e);
    return res.status(500).json({ error: 'Bütçeler getirilemedi' });
  }
});

// Create budget
app.post('/api/budgets', auth, async (req, res) => {
  try {
    const { travelName, totalBudget, currency } = req.body;
    if (!travelName || !totalBudget) {
      return res.status(400).json({ error: 'Seyahat adı ve bütçe gereklidir' });
    }
    const budget = await Budget.create({ 
      userId: req.user.id, 
      travelName, 
      totalBudget, 
      currency: currency || 'TRY'
    });
    return res.status(201).json({ budget });
  } catch (e) {
    console.error('Create budget error:', e);
    return res.status(500).json({ error: 'Bütçe oluşturulamadı' });
  }
});

// Add expense
app.post('/api/budgets/:id/expenses', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category } = req.body;
    if (!description || !amount) {
      return res.status(400).json({ error: 'Açıklama ve tutar gereklidir' });
    }
    const budget = await Budget.findByIdAndUserId(id, req.user.id);
    if (!budget) return res.status(404).json({ error: 'Bütçe bulunamadı' });
    
    await Budget.addExpense(id, { description, amount, category: category || 'Diğer' });
    const updatedBudget = await Budget.findById(id);
    return res.json({ budget: updatedBudget });
  } catch (e) {
    console.error('Add expense error:', e);
    return res.status(500).json({ error: 'Harcama eklenemedi' });
  }
});

// Delete expense
app.delete('/api/budgets/:id/expenses/:expenseId', auth, async (req, res) => {
  try {
    const { id, expenseId } = req.params;
    const budget = await Budget.findByIdAndUserId(id, req.user.id);
    if (!budget) return res.status(404).json({ error: 'Bütçe bulunamadı' });
    
    await Budget.deleteExpense(expenseId);
    const updatedBudget = await Budget.findById(id);
    return res.json({ budget: updatedBudget });
  } catch (e) {
    console.error('Delete expense error:', e);
    return res.status(500).json({ error: 'Harcama silinemedi' });
  }
});

// Delete budget
app.delete('/api/budgets/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Budget.deleteById(id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Bütçe bulunamadı' });
    return res.json({ message: 'Silindi' });
  } catch (e) {
    console.error('Delete budget error:', e);
    return res.status(500).json({ error: 'Bütçe silinemedi' });
  }
});

// ===== TodoList Endpoints =====
// List all todo lists
app.get('/api/todos', auth, async (req, res) => {
  try {
    const lists = await TodoList.findByUserId(req.user.id);
    return res.json({ lists });
  } catch (e) {
    console.error('Get todos error:', e);
    return res.status(500).json({ error: 'Yapılacaklar listeleri getirilemedi' });
  }
});

// Create todo list
app.post('/api/todos', auth, async (req, res) => {
  try {
    const { travelName } = req.body || {};
    if (!travelName) return res.status(400).json({ error: 'Seyahat adı gereklidir' });
    const list = await TodoList.create({ userId: req.user.id, travelName });
    return res.status(201).json({ list });
  } catch (e) {
    console.error('Create todo list error:', e);
    return res.status(500).json({ error: 'Liste oluşturulamadı' });
  }
});

// Add todo item
app.post('/api/todos/:id/items', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Görev metni gereklidir' });
    const list = await TodoList.findByIdAndUserId(id, req.user.id);
    if (!list) return res.status(404).json({ error: 'Liste bulunamadı' });
    
    await TodoList.addItem(id, { text });
    const updatedList = await TodoList.findById(id);
    return res.json({ list: updatedList });
  } catch (e) {
    console.error('Add todo item error:', e);
    return res.status(500).json({ error: 'Görev eklenemedi' });
  }
});

// Toggle complete
app.patch('/api/todos/:id/items/:itemId/toggle', auth, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const list = await TodoList.findByIdAndUserId(id, req.user.id);
    if (!list) return res.status(404).json({ error: 'Liste bulunamadı' });
    
    const item = await TodoList.toggleItem(itemId);
    if (!item) return res.status(404).json({ error: 'Görev bulunamadı' });
    
    const updatedList = await TodoList.findById(id);
    return res.json({ list: updatedList });
  } catch (e) {
    console.error('Toggle todo item error:', e);
    return res.status(500).json({ error: 'Görev güncellenemedi' });
  }
});

// Delete item
app.delete('/api/todos/:id/items/:itemId', auth, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const list = await TodoList.findByIdAndUserId(id, req.user.id);
    if (!list) return res.status(404).json({ error: 'Liste bulunamadı' });
    
    await TodoList.deleteItem(itemId);
    const updatedList = await TodoList.findById(id);
    return res.json({ list: updatedList });
  } catch (e) {
    console.error('Delete todo item error:', e);
    return res.status(500).json({ error: 'Görev silinemedi' });
  }
});

// Delete list
app.delete('/api/todos/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TodoList.deleteById(id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Liste bulunamadı' });
    return res.json({ message: 'Silindi' });
  } catch (e) {
    console.error('Delete todo list error:', e);
    return res.status(500).json({ error: 'Liste silinemedi' });
  }
});

// ===== Currency Exchange Proxy Endpoint =====
app.get('/api/currency/rates', async (req, res) => {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/TRY', {
      timeout: 5000
    });
    return res.json(response.data);
  } catch (err) {
    console.error('Currency API error:', err.message);
    return res.status(500).json({ error: 'Döviz kurları alınamadı' });
  }
});

// ===== Plan Summary Endpoint =====
app.get('/api/plans/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Tüm verileri paralel olarak çek
    const [plans, budgets, todos] = await Promise.all([
      Plan.findByUserId(userId),
      Budget.findByUserId(userId),
      TodoList.findByUserId(userId)
    ]);

    // İstatistikler hesapla
    const totalPlans = plans.length;
    const favoritePlans = plans.filter(p => p.isFavorite).length;
    
    const totalBudgets = budgets.length;
    const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.totalBudget, 0);
    const totalExpenses = budgets.reduce((sum, b) => {
      return sum + (b.totalExpenses || 0);
    }, 0);
    const remainingBudget = totalBudgetAmount - totalExpenses;

    const totalTodoLists = todos.length;
    const totalTodoItems = todos.reduce((sum, list) => sum + list.items.length, 0);
    const completedTodoItems = todos.reduce((sum, list) => {
      return sum + list.items.filter(item => item.completed).length;
    }, 0);
    const pendingTodoItems = totalTodoItems - completedTodoItems;

    // Kategori bazlı harcama analizi
    const expensesByCategory = {};
    budgets.forEach(budget => {
      budget.expenses.forEach(expense => {
        const category = expense.category || 'Diğer';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + expense.amount;
      });
    });

    // En son eklenen veriler
    const recentPlans = plans.slice(0, 3).map(p => ({
      id: p.id,
      title: p.title,
      createdAt: p.createdAt
    }));

    const recentBudgets = budgets.slice(0, 3).map(b => ({
      id: b.id,
      travelName: b.travelName,
      totalBudget: b.totalBudget,
      totalExpenses: b.totalExpenses || 0
    }));

    const summary = {
      plans: {
        total: totalPlans,
        favorites: favoritePlans,
        recent: recentPlans
      },
      budgets: {
        total: totalBudgets,
        totalAmount: totalBudgetAmount,
        totalExpenses: totalExpenses,
        remaining: remainingBudget,
        byCategory: expensesByCategory,
        recent: recentBudgets
      },
      todos: {
        totalLists: totalTodoLists,
        totalItems: totalTodoItems,
        completed: completedTodoItems,
        pending: pendingTodoItems,
        completionRate: totalTodoItems > 0 ? Math.round((completedTodoItems / totalTodoItems) * 100) : 0
      },
      generatedAt: new Date().toISOString()
    };

    return res.json({ summary });
  } catch (e) {
    console.error('Get summary error:', e);
    return res.status(500).json({ error: 'Özet oluşturulamadı' });
  }
});

// ===== SuperAdmin Endpoints =====
// SuperAdmin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    
    // Hardcoded admin credentials
    const ADMIN_USERNAME = 'yolacikadmin';
    const ADMIN_PASSWORD = 'yolacikadmin123';
    
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }
    
    // Create admin token
    const token = jwt.sign({ isAdmin: true, username }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '24h' });
    return res.json({ token, admin: { username } });
  } catch (e) {
    console.error('Admin login error:', e);
    return res.status(500).json({ error: 'Giriş başarısız' });
  }
});

// Get all users (admin only)
app.get('/api/admin/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token gereklidir' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Yetkisiz erişim' });
    
    // Include password field for admin
    const users = await User.findAll();
    return res.json({ users });
  } catch (e) {
    console.error('Get users error:', e);
    return res.status(500).json({ error: 'Kullanıcılar getirilemedi' });
  }
});

// Update user password (admin only)
app.patch('/api/admin/users/:id/password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token gereklidir' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Yetkisiz erişim' });
    
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalıdır' });
    }
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(id, hashed);
    
    return res.json({ message: 'Şifre başarıyla güncellendi', user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    console.error('Update password error:', e);
    return res.status(500).json({ error: 'Şifre güncellenemedi' });
  }
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001'));
