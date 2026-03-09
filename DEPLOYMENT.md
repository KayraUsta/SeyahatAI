# Yola Çık AI - Deployment Guide

## 🚀 Coolify ile Deployment

### Gereksinimler
- Coolify kurulu bir sunucu
- GitHub repository
- Domain: `yolacikai.com` ve `api.yolacikai.com`

### Adım 1: GitHub Repository Secrets

GitHub repository'nizde şu secrets'ları ekleyin:

```
COOLIFY_TOKEN=your-coolify-api-token
COOLIFY_WEBHOOK_URL=https://your-coolify-instance/api/v1/deploy
```

### Adım 2: Coolify Konfigürasyonu

1. Coolify dashboard'a gidin
2. "New Resource" > "Docker Compose" seçin
3. GitHub repository'nizi bağlayın
4. Docker Compose dosyası olarak `docker-compose.coolify.yml` seçin

### Adım 3: Environment Variables

Coolify'da şu environment variables'ları ekleyin:

| Variable | Description |
|----------|-------------|
| `DB_HOST` | MSSQL sunucu adresi |
| `DB_PORT` | MSSQL port (default: 1433) |
| `DB_USER` | Database kullanıcı adı |
| `DB_PASSWORD` | Database şifresi |
| `DB_NAME` | Database adı |
| `JWT_SECRET` | JWT token için secret key |
| `EMAIL_HOST` | SMTP sunucu (örn: smtp.gmail.com) |
| `EMAIL_PORT` | SMTP port (örn: 587) |
| `EMAIL_USER` | Email adresi |
| `EMAIL_PASS` | Email app password |
| `GEMINI_API_KEY` | Google Gemini API key |

### Adım 4: Domain Konfigürasyonu

Coolify'da her servis için domain ayarlayın:

- **Backend:** `api.yolacikai.com` → Port 3001
- **Frontend:** `yolacikai.com` → Port 80

### Adım 5: SSL Sertifikası

Coolify otomatik olarak Let's Encrypt SSL sertifikası oluşturacaktır.

---

## 🔧 Manuel Docker Deployment

```bash
# Clone repository
git clone https://github.com/your-username/yolacikai.git
cd yolacikai

# Environment dosyasını oluştur
cp .env.example .env
# .env dosyasını düzenle

# Build ve başlat
docker-compose up -d --build

# Logları kontrol et
docker-compose logs -f
```

---

## 📁 Dosya Yapısı

```
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf
│   └── ...
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docker-compose.yml
├── docker-compose.coolify.yml
├── .env.example
└── DEPLOYMENT.md
```

---

## 🌐 URL'ler

| Servis | URL |
|--------|-----|
| Frontend | https://yolacikai.com |
| Backend API | https://api.yolacikai.com |
| Health Check (Backend) | https://api.yolacikai.com/health |
| Health Check (Frontend) | https://yolacikai.com/health |

---

## 🔄 GitHub Actions

Her `main` veya `master` branch'ine push yapıldığında:

1. Backend ve Frontend Docker image'ları build edilir
2. GitHub Container Registry'ye push edilir
3. Coolify webhook tetiklenir
4. Coolify otomatik olarak yeni image'ları deploy eder

---

## 🐛 Troubleshooting

### Container başlamıyor
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Database bağlantı hatası
- `DB_HOST`, `DB_USER`, `DB_PASSWORD` değerlerini kontrol edin
- Firewall ayarlarını kontrol edin

### SSL sertifikası hatası
- Domain DNS ayarlarının doğru olduğundan emin olun
- Coolify'da SSL'i yeniden oluşturun
