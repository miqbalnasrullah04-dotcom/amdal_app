-- Script untuk memperbaiki kolom OTP di database
-- Jalankan ini jika migration gagal atau OTP tidak berfungsi

-- 1. Cek struktur kolom OTP saat ini
DESCRIBE users;

-- 2. Jika kolom belum ada, tambahkan:
ALTER TABLE users 
ADD COLUMN otp_code VARCHAR(6) NULL AFTER password,
ADD COLUMN otp_expires_at TIMESTAMP NULL AFTER otp_code;

-- 3. Jika kolom sudah ada tapi tipe data salah (misal: INT), ubah ke VARCHAR:
-- ALTER TABLE users MODIFY COLUMN otp_code VARCHAR(6) NULL;

-- 4. Reset semua OTP yang ada (opsional - untuk clean start)
-- UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE otp_code IS NOT NULL;

-- 5. Verifikasi hasil
SELECT id, email, otp_code, otp_expires_at FROM users WHERE otp_code IS NOT NULL;
