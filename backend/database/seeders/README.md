# Database Seeders

Dokumentasi untuk semua database seeders yang tersedia di aplikasi TenagaAhli.com

## 🌱 Daftar Seeders

### 1. **UserSeeder**
Membuat user default untuk testing dan admin.

**Data yang dibuat:**
- Admin: `admin@tenagaahli.com` / `admin123` (role: admin)
- User: `user@tenagaahli.com` / `user123` (role: user)

### 2. **CategorySeeder**
Membuat kategori untuk tenaga ahli.

**Data yang dibuat:**
- AMDAL
- UKL-UPL
- KLHS
- Audit Lingkungan
- Dll.

### 3. **PackageSeeder**
Membuat paket langganan untuk tenaga ahli.

**Data yang dibuat:**
- Paket Basic
- Paket Professional
- Paket Enterprise

### 4. **ExpertSeeder**
Membuat data tenaga ahli sample.

**Data yang dibuat:**
- 1 expert lengkap dengan profile

### 5. **ExpertRelationsSeeder**
Membuat data relasi untuk expert (pendidikan, pengalaman, sertifikat, dokumen).

**Data yang dibuat:**
- 3 Education records
- 3 Experience records
- 3 Certificate records

### 6. **ArticleSeeder**
Membuat artikel sample.

**Data yang dibuat:**
- 3 artikel terkait AMDAL dan lingkungan

### 7. **PartnerSeeder**
Membuat data partner/mitra.

**Data yang dibuat:**
- 5 partner (universitas, lembaga pemerintah, dll)

### 8. **PamfletSeeder**
Membuat pamflet sample untuk halaman public.

**Data yang dibuat:**
- 5 pamflet (training, seminar, workshop, announcement)

## 📝 Cara Menggunakan

### Jalankan Semua Seeders

```bash
php artisan db:seed
```

### Jalankan Seeder Tertentu

```bash
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=PamfletSeeder
```

### Reset Database + Seed (Fresh Start)

```bash
php artisan migrate:fresh --seed
```

**⚠️ WARNING:** Perintah ini akan **menghapus semua data** dan membuat ulang database dari awal!

### Refresh Hanya Table Tertentu

```bash
php artisan migrate:refresh --path=database/migrations/2026_08_06_032235_create_pamflets_table.php
php artisan db:seed --class=PamfletSeeder
```

## 🔐 Kredensial Default

Setelah seeding, gunakan kredensial berikut untuk login:

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@tenagaahli.com     | admin123  |
| User  | user@tenagaahli.com      | user123   |

## 📊 Data Statistics

Setelah menjalankan semua seeders, database akan berisi:

- **Users**: 2 (1 admin, 1 user)
- **Categories**: ~8 kategori
- **Packages**: 3 paket
- **Experts**: 1 expert lengkap
- **Educations**: 3 records
- **Experiences**: 3 records
- **Certificates**: 3 records
- **Articles**: 3 artikel
- **Partners**: 5 partners
- **Pamflets**: 5 pamflets

## 🚀 GitHub Setup

Saat clone repository, jalankan:

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Generate application key
php artisan key:generate

# 3. Konfigurasi database di .env
DB_DATABASE=tenagaahli_db
DB_USERNAME=root
DB_PASSWORD=

# 4. Jalankan migration dan seeder
php artisan migrate:fresh --seed

# 5. Link storage
php artisan storage:link
```

## 📁 File Structure

```
database/seeders/
├── DatabaseSeeder.php          # Main seeder (memanggil semua seeder)
├── UserSeeder.php              # User & admin data
├── CategorySeeder.php          # Kategori tenaga ahli
├── PackageSeeder.php           # Paket langganan
├── ExpertSeeder.php            # Data tenaga ahli
├── ExpertRelationsSeeder.php   # Relasi expert (edu, exp, cert)
├── ArticleSeeder.php           # Artikel
├── PartnerSeeder.php           # Partner/Mitra
└── PamfletSeeder.php           # Pamflet
```

## ✅ Best Practices

1. **Development**: Gunakan `php artisan migrate:fresh --seed` untuk reset data
2. **Production**: Jangan pernah jalankan `migrate:fresh` di production!
3. **Testing**: Buat seeder terpisah untuk data testing
4. **Backup**: Selalu backup database sebelum menjalankan migration

## 🔧 Troubleshooting

### Error: Table already exists
```bash
php artisan migrate:fresh --seed
```

### Error: Class not found
```bash
composer dump-autoload
php artisan db:seed
```

### Error: Duplicate entry
Database sudah punya data. Gunakan `migrate:fresh --seed` atau hapus data manual.

---

**Last Updated:** 2026-08-06
**Version:** 1.0.0
