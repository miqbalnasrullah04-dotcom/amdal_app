# Debug OTP - Troubleshooting Guide

## Masalah: "Kode OTP salah" padahal belum 1 menit

### Cara Debug:

1. **Cek OTP di Database**
   ```sql
   SELECT id, email, otp_code, otp_expires_at, created_at 
   FROM users 
   WHERE email = 'email-user@example.com' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

2. **Cek Log Laravel**
   File: `storage/logs/laravel.log`
   
   Cari:
   ```
   OTP Verification Attempt
   ```
   
   Akan menampilkan:
   - Email
   - OTP yang diinput user
   - OTP yang tersimpan di database
   - Waktu expire
   - Apakah sudah expired

3. **Test dengan Response Debug**
   Saat verifikasi gagal, jika `APP_DEBUG=true`, response akan menampilkan:
   ```json
   {
     "message": "Kode OTP salah.",
     "debug": {
       "input": "123456",
       "stored": "654321"
     }
   }
   ```

### Kemungkinan Penyebab:

1. **OTP tidak tersimpan dengan benar**
   - Cek apakah kolom `otp_code` di database bertipe VARCHAR/TEXT
   - Leading zeros mungkin hilang jika kolom INTEGER

2. **User mendaftar ulang**
   - OTP lama ter-replace dengan OTP baru
   - User harus gunakan OTP terbaru

3. **Whitespace atau karakter tersembunyi**
   - OTP code mungkin ada space di depan/belakang
   - Frontend sudah handle `.trim()` tapi cek database

4. **Case sensitive** (jarang terjadi untuk angka)
   - OTP seharusnya numerik 6 digit

### Solusi:

1. **Gunakan OTP dari box kuning** (Development Mode)
   - OTP ditampilkan langsung di halaman verifikasi
   - Tidak perlu tunggu email

2. **Cek email yang benar**
   - Pastikan menggunakan email yang sama saat registrasi

3. **Request OTP baru**
   - Klik "Kirim Ulang Kode"
   - Gunakan kode terbaru

4. **Manual verify via database** (emergency):
   ```sql
   UPDATE users 
   SET email_verified_at = NOW(), 
       otp_code = NULL, 
       otp_expires_at = NULL 
   WHERE email = 'email-user@example.com';
   ```

### Fix Permanen:

Jika masalah persist, cek migration kolom `otp_code`:

```php
// Harus VARCHAR/STRING, bukan INTEGER
$table->string('otp_code', 6)->nullable();
```

Jika INTEGER, ubah ke STRING:
```sql
ALTER TABLE users MODIFY otp_code VARCHAR(6);
```
