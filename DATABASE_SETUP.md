# AMDAL App - Database Setup Guide

## 📋 Overview
Panduan lengkap untuk setup dan konfigurasi database untuk aplikasi AMDAL (Analisis Mengenai Dampak Lingkungan).

## 🛠 Prerequisites
- **Laragon** atau server lokal lainnya (XAMPP/WAMP) yang sudah terinstal
- **MySQL Database** berjalan di port 3306
- **PHP 8.1+** 
- **Composer** untuk manajemen package PHP
- **Node.js & npm** untuk frontend

## 🔧 Konfigurasi Database

### 1. Database Configuration
Database sudah dikonfigurasi dengan:
- **Host:** 127.0.0.1
- **Port:** 3306
- **Database:** `amdal_id`
- **Username:** `root`
- **Password:** (kosong untuk Laragon)

### 2. Environment Variables
File `.env` di backend sudah dikonfigurasi dengan:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=amdal_id
DB_USERNAME=root
DB_PASSWORD=
```

## 🚀 Quick Setup

### Opsi 1: Setup Otomatis
```bash
# Jalankan script setup otomatis
setup-all.bat
```

### Opsi 2: Setup Manual

#### Backend Setup:
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan config:clear
```

#### Frontend Setup:
```bash
cd frontend
npm install
```

## 📊 Database Schema

### Tabel Utama:
1. **users** - Data pengguna sistem
2. **experts** - Data tenaga ahli AMDAL
3. **categories** - Kategori keahlian
4. **articles** - Artikel dan blog
5. **partners** - Mitra kerjasama
6. **orders** - Pesanan dan transaksi
7. **packages** - Paket layanan
8. **educations** - Data pendidikan ahli
9. **experiences** - Pengalaman kerja ahli
10. **certificates** - Sertifikat ahli
11. **documents** - Dokumen pendukung
12. **submissions** - Pengajuan verifikasi

### Tabel Sistem:
- **personal_access_tokens** - Token autentikasi API
- **sessions** - Session management
- **cache** - Application cache
- **jobs** - Background jobs
- **migrations** - Database migration history

## 🔍 Testing Database Connection

### 1. Via Command Line:
```bash
cd backend
php artisan db:show
```

### 2. Via Health Check API:
```bash
# Start server
php artisan serve

# Test endpoint
curl http://localhost:8000/api/health-check
```

### 3. Via Browser:
Kunjungi: `http://localhost:8000/api/health-check`

## 🏃‍♂️ Running the Application

### Start Development Servers:
```bash
# Opsi 1: Gunakan script otomatis
start-dev.bat

# Opsi 2: Manual
# Terminal 1 - Backend
cd backend
php artisan serve

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### URLs:
- **Backend API:** http://localhost:8000
- **Frontend App:** http://localhost:5173 atau http://localhost:5174
- **API Health Check:** http://localhost:8000/api/health-check

## 🛡 Security & Performance

### Database Security:
- Menggunakan Laravel Eloquent ORM untuk mencegah SQL injection
- Password di-hash menggunakan bcrypt
- API menggunakan Sanctum tokens untuk autentikasi

### Performance Optimizations:
- Database indexes pada kolom yang sering dicari
- Caching menggunakan database driver
- Session storage di database untuk skalabilitas

## 📝 API Endpoints

### Public Endpoints:
- `GET /api/health-check` - Status sistem
- `POST /api/login` - Login pengguna
- `POST /api/register` - Registrasi pengguna
- `GET /api/experts` - Daftar tenaga ahli
- `GET /api/articles` - Daftar artikel
- `GET /api/categories` - Daftar kategori
- `GET /api/packages` - Daftar paket layanan

### Protected Endpoints (Require Auth):
- `GET /api/user` - Data pengguna current
- `GET /api/my/profile` - Profil ahli sendiri
- `POST /api/my/profile` - Update profil
- `GET /api/my/educations` - Data pendidikan
- `GET /api/my/experiences` - Data pengalaman
- `GET /api/my/certificates` - Data sertifikat

## 🔧 Troubleshooting

### Common Issues:

#### 1. Connection Refused:
```bash
# Pastikan MySQL berjalan
# Cek di Laragon control panel

# Test koneksi
php artisan tinker
DB::connection()->getPdo();
```

#### 2. Permission Denied:
```bash
# Set permission folder storage
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

#### 3. Migration Errors:
```bash
# Reset migrations
php artisan migrate:fresh

# Rollback dan migrate ulang
php artisan migrate:rollback
php artisan migrate
```

#### 4. Frontend API Connection:
- Pastikan CORS dikonfigurasi dengan benar
- Cek environment variables di `.env` frontend
- Pastikan backend server berjalan di port 8000

### Log Files:
- **Laravel Logs:** `backend/storage/logs/laravel.log`
- **Frontend Console:** Browser Developer Tools

## 📞 Support

Jika mengalami masalah:
1. Cek log files untuk error details
2. Pastikan semua services (MySQL, PHP) berjalan
3. Verifikasi environment variables
4. Test health check endpoint

## 🔄 Updates & Maintenance

### Update Database Schema:
```bash
php artisan make:migration create_new_table
php artisan migrate
```

### Backup Database:
```bash
mysqldump -u root -p amdal_id > backup_amdal.sql
```

### Restore Database:
```bash
mysql -u root -p amdal_id < backup_amdal.sql
```