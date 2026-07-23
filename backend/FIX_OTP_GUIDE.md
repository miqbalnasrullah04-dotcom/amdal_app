# 🔧 Fix OTP "Kode Salah" - Panduan Lengkap

## Masalah
Kode OTP selalu salah padahal baru diinput dalam 1 menit.

## Root Cause
Kolom `otp_code` dan `otp_expires_at` tidak ada di database atau tipe datanya salah.

---

## ✅ Solusi Step-by-Step

### Step 1: Jalankan Migration

```bash
cd TenagaAhli/backend
php artisan migrate
```

**Jika sukses:**
```
Migrating: 2026_07_23_000000_add_otp_fields_to_users_table
Migrated:  2026_07_23_000000_add_otp_fields_to_users_table
```
✅ Lanjut ke Step 3

**Jika error "Duplicate column name":**
⚠️ Kolom sudah ada, lanjut ke Step 2

---

### Step 2: Fix Manual via SQL (jika kolom sudah ada)

Buka phpMyAdmin atau database client Anda, jalankan:

```sql
-- Cek tipe data kolom saat ini
DESCRIBE users;
```

**Jika `otp_code` bertipe INT atau salah:**
```sql
ALTER TABLE users MODIFY COLUMN otp_code VARCHAR(6) NULL;
```

**Jika kolom tidak ada sama sekali:**
```sql
ALTER TABLE users 
ADD COLUMN otp_code VARCHAR(6) NULL AFTER password,
ADD COLUMN otp_expires_at TIMESTAMP NULL AFTER otp_code;
```

---

### Step 3: Clear Cache

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

---

### Step 4: Test Registrasi Baru

1. **Buat akun baru** dengan email yang belum pernah dipakai
2. **Cek halaman verifikasi** - akan ada **box kuning** dengan OTP code
3. **Copy OTP dari box kuning** dan paste
4. **Klik Verifikasi**

✅ Jika berhasil: OTP sekarang sudah berfungsi!
❌ Jika masih gagal: Lanjut ke Step 5

---

### Step 5: Debug Lebih Lanjut

#### A. Cek Database Langsung

```sql
SELECT id, email, otp_code, otp_expires_at, created_at 
FROM users 
WHERE email = 'email-test@example.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

Pastikan:
- ✅ `otp_code` terisi (6 digit)
- ✅ `otp_expires_at` adalah waktu masa depan (lebih dari NOW())

#### B. Cek Log Laravel

Buka: `storage/logs/laravel.log`

Cari:
```
OTP Verification Attempt
```

Perhatikan:
- `input_otp`: Yang diinput user
- `stored_otp`: Yang ada di database
- `is_expired`: true/false

Jika `input_otp` ≠ `stored_otp` tapi Anda yakin benar:
→ Masalah whitespace atau karakter tersembunyi

#### C. Test dengan Postman/Insomnia

```http
POST http://localhost:8000/api/verify-email
Content-Type: application/json

{
  "email": "test@example.com",
  "otp_code": "123456"
}
```

Response akan menampilkan debug info jika `APP_DEBUG=true`

---

### Step 6: Emergency Fix (Manual Verify)

Jika urgent dan perlu verifikasi user secara manual:

```sql
UPDATE users 
SET email_verified_at = NOW(), 
    otp_code = NULL, 
    otp_expires_at = NULL 
WHERE email = 'user@example.com';
```

Lalu user bisa langsung login.

---

## 🎯 Prevention

Untuk mencegah masalah serupa:

1. **Selalu run migration** setelah update code
2. **Gunakan version control** untuk migration files
3. **Backup database** sebelum migration
4. **Test di development** dulu sebelum production

---

## 📋 Checklist

- [ ] Migration berhasil dijalankan
- [ ] Kolom `otp_code` bertipe VARCHAR(6)
- [ ] Kolom `otp_expires_at` bertipe TIMESTAMP
- [ ] Cache sudah di-clear
- [ ] Test registrasi baru berhasil
- [ ] Email OTP terkirim (atau muncul di box kuning)
- [ ] Verifikasi OTP berhasil

---

## 🆘 Masih Bermasalah?

Cek file `DEBUG_OTP.md` untuk troubleshooting lebih detail.

Atau hubungi developer dengan info:
1. Screenshot error message
2. Log dari `storage/logs/laravel.log`
3. Output SQL: `DESCRIBE users;`
4. Versi PHP dan Laravel
