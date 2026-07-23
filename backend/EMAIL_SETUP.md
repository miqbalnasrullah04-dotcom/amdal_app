# Setup Email untuk OTP - TenagaAhli.com

OTP (One-Time Password) akan di-log ke file Laravel. Anda dapat melihatnya di `storage/logs/laravel.log`.

## Untuk Development (Saat Ini)

Karena email belum dikonfigurasi, OTP akan tetap dibuat dan di-log. Cara melihat OTP:

1. Setelah user registrasi, buka file log Laravel:
   ```
   TenagaAhli/backend/storage/logs/laravel.log
   ```

2. Cari baris dengan format:
   ```
   OTP for user@email.com (email failed, use this code): 123456
   ```

3. Gunakan kode OTP tersebut untuk verifikasi

## Opsi 1: Gmail SMTP (Untuk Production)

1. Enable 2-Step Verification di akun Gmail Anda
2. Generate App Password:
   - https://myaccount.google.com/apppasswords
   - Pilih "Mail" dan device "Other"
   - Copy password yang digenerate

3. Update `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@tenagaahli.com"
MAIL_FROM_NAME="TenagaAhli.com"
```

## Opsi 2: Mailtrap (Untuk Testing)

1. Daftar gratis di https://mailtrap.io
2. Buat inbox baru
3. Copy credentials dari tab "SMTP Settings"

4. Update `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@tenagaahli.com"
MAIL_FROM_NAME="TenagaAhli.com"
```

5. Email akan tertangkap di Mailtrap inbox (tidak terkirim ke email asli)

## Opsi 3: Log Driver (Development Tanpa SMTP)

Jika hanya ingin test tanpa setup SMTP:

1. Update `.env`:
```env
MAIL_MAILER=log
```

2. Email akan ditulis ke `storage/logs/laravel.log`

## Test Email

Setelah konfigurasi, test dengan:

```bash
php artisan tinker
```

```php
Mail::raw('Test email', function ($message) {
    $message->to('test@example.com')
            ->subject('Test');
});
```

## Troubleshooting

### Email tidak terkirim dari Gmail
- Pastikan 2-Step Verification aktif
- Gunakan App Password, bukan password Gmail biasa
- Cek "Less secure app access" (deprecated, gunakan App Password)

### Error "Connection refused"
- Cek firewall tidak block port 587/2525
- Cek MAIL_HOST dan MAIL_PORT benar

### Email masuk spam
- Setup SPF, DKIM, DMARC records di DNS domain
- Gunakan domain email yang sama dengan website
- Hindari kata-kata spam di subject/body

## Cache Config

Setelah update `.env`, clear cache:

```bash
php artisan config:clear
php artisan cache:clear
```

## Status Saat Ini

✅ OTP di-log ke `storage/logs/laravel.log`
✅ Register tetap berfungsi meski email gagal
✅ Admin tidak perlu OTP (bypass email verification)
⚠️ Email belum dikonfigurasi (gunakan log untuk lihat OTP)

## Rekomendasi

- **Development**: Gunakan Mailtrap atau Log driver
- **Production**: Gunakan Gmail SMTP atau layanan email profesional (SendGrid, AWS SES, dll)
