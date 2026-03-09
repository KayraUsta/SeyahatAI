# Zai Database Manual Setup Guide

## 📋 SQL Server Tablolarını Manuel Oluşturma

MSSQL bağlantısı şu an çalışmıyor, bu yüzden tabloları manuel olarak oluşturmanız gerekiyor.

### 🔧 Yöntem 1: SQL Server Management Studio (SSMS)

1. **SSMS'i açın**
2. **Zai veritabanına bağlanın**
3. **New Query** butonuna tıklayın
4. Aşağıdaki kodu kopyalayıp yapıştırın:
   ```sql
   -- Dosya: backend/config/create-tables-mssql.sql
   -- Bu dosyadaki tüm kodu kopyalayın
   ```

### 🔧 Yöntem 2: SQL Script Dosyasını Kullanma

1. **Oluşturulan dosya**: `backend/config/create-tables-mssql.sql`
2. **SSMS'de**: File → Open → `create-tables-mssql.sql`
3. **Execute** butonuna basın (F5)

### 🔧 Yöntem 3: Command Line (sqlcmd)

```cmd
sqlcmd -S 10.14.1.3,52516 -d Zai -U eflow -P M!kro12345 -i "backend\config\create-tables-mssql.sql"
```

## 📊 Oluşturulacak Tablolar

- ✅ **Users** - Kullanıcı bilgileri
- ✅ **Plans** - Seyahat planları  
- ✅ **Budgets** - Bütçe yönetimi
- ✅ **Expenses** - Harcama detayları
- ✅ **TodoLists** - Görev listeleri
- ✅ **TodoItems** - Görev detayları
- ✅ **PasswordResets** - Şifre sıfırlama

## 🔍 Bağlantı Sorunları Çözümü

### 1. Credentials Kontrol
```bash
# .env dosyasını kontrol et
DB_SERVER=10.14.1.3
DB_PORT=52516
DB_DATABASE=Zai
DB_USER=eflow
DB_PASSWORD=M!kro12345
```

### 2. Network Test
```cmd
# Server'a ping at
ping 10.14.1.3

# Port test (telnet gerekli)
telnet 10.14.1.3 52516
```

### 3. SQL Server Authentication
- Windows Authentication mu? SQL Server Authentication mu?
- User "eflow" var mı?
- Parola doğru mu?

### 4. Database Permissions
- "eflow" kullanıcısı CREATE TABLE yetkisi var mı?
- "Zai" veritabanı var mı?

## 🚀 Test Etme

Tablolar oluşturulduktan sonra:

```bash
# Backend'i test et
npm run dev

# API test
curl http://localhost:3001/api/health
```

## 📞 Yardım

Eğer sorun devam ederse:
1. SQL Server log'larını kontrol et
2. Network admin ile konuş
3. Firewall ayarlarını kontrol et
