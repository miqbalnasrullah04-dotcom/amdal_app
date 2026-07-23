# Panduan Setup Midtrans Payment Gateway

## 📋 Daftar Implementasi yang Sudah Selesai

✅ **Backend:**
- Midtrans PHP package terinstall (midtrans/midtrans-php v2.6.2)
- Konfigurasi Midtrans di `config/services.php`
- Migration untuk kolom `snap_token` dan `payment_type` di tabel orders
- OrderController dengan metode:
  - `choosePackage()`: Generate snap_token dari Midtrans
  - `notification()`: Webhook handler untuk status pembayaran
- Route webhook: `POST /api/midtrans/notification`

✅ **Frontend:**
- PilihPaket.jsx: Integrasi Midtrans Snap popup
- Pembayaran.jsx: Tombol "Bayar Sekarang" dengan Midtrans + fallback upload manual
- AdminPayments.jsx: Menampilkan payment method (Midtrans/Manual) dan status

---

## 🔑 Cara Mendapatkan Credentials Midtrans

### 1. Daftar Akun Midtrans Sandbox (Testing)
1. Kunjungi: https://dashboard.sandbox.midtrans.com/register
2. Isi form registrasi dengan email aktif
3. Verifikasi email dan login

### 2. Dapatkan API Keys
Setelah login ke dashboard sandbox:
1. Buka **Settings → Access Keys**
2. Copy credentials berikut:
   - **Server Key** (untuk backend)
   - **Client Key** (untuk frontend)

### 3. Update Environment Variables

#### Backend (`.env`)
```env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```

#### Frontend (`frontend/.env`)
```env
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxx
```

---

## 🧪 Testing dengan Sandbox

### Cara Test Payment:
1. **Pilih Paket Premium** di dashboard user
2. Klik **"Bayar Sekarang"** → Midtrans Snap popup muncul
3. Gunakan **test credentials** di bawah:

### Test Card Numbers (Credit Card):
- **Success:** `4811 1111 1111 1114`
- **Pending:** `4911 1111 1111 1113`
- **Denied:** `4411 1111 1111 1118`
- CVV: `123` | Exp: `01/25`

### Test E-Wallet:
- **GoPay/QRIS:** Scan QR dengan simulator di dashboard sandbox
- **OVO/DANA:** Otomatis success di sandbox

### Test Virtual Account:
- **BCA VA:** `{payment_code}` (auto-generated)
- Status akan update otomatis via webhook

---

## 🔔 Setup Webhook untuk Production

### 1. Webhook URL
Midtrans akan mengirim notifikasi pembayaran ke:
```
https://your-domain.com/api/midtrans/notification
```

### 2. Konfigurasi di Dashboard Midtrans
1. Login ke dashboard (sandbox atau production)
2. **Settings → Configuration → Notification URL**
3. Masukkan URL webhook Anda
4. **Payment Notification URL:** `https://your-domain.com/api/midtrans/notification`
5. Centang **HTTP Notification**
6. Save

### 3. Verifikasi Webhook
OrderController sudah memiliki signature verification:
```php
$notification = new \Midtrans\Notification();
$status = $notification->transaction_status;
```

---

## 🚀 Go Live (Production)

### 1. Upgrade ke Production Account
1. Login ke dashboard sandbox
2. Klik **"Activate Production"**
3. Lengkapi verifikasi bisnis (KTP, NPWP, dokumen)
4. Tunggu approval (biasanya 1-3 hari kerja)

### 2. Update Credentials Production
Setelah approved, dapatkan production keys:
```env
MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=true
```

### 3. Update Snap Script URL
Di `PilihPaket.jsx` dan `Pembayaran.jsx`:
```javascript
// Sandbox (testing):
script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';

// Production (live):
script.src = 'https://app.midtrans.com/snap/snap.js';
```

**Gunakan environment variable untuk switch otomatis:**
```javascript
const snapUrl = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';
```

---

## 📊 Flow Pembayaran

### User Side:
1. User pilih paket premium → order dibuat dengan `snap_token`
2. User klik "Bayar Sekarang" → Midtrans Snap popup
3. User pilih metode: Credit Card / E-Wallet / Bank Transfer / QRIS
4. User selesaikan pembayaran
5. **Midtrans kirim webhook** → Backend update status order

### Admin Side:
1. Order dengan Midtrans: **Otomatis verified** jika settlement
2. Order manual: Admin harus **approve bukti transfer**
3. Kolom "Metode" menunjukkan: 🔵 Midtrans / 📄 Transfer Manual

---

## 🛠️ Troubleshooting

### 1. "Snap token not found"
- Pastikan `snap_token` disimpan di database order
- Check response dari `OrderController::choosePackage()`

### 2. Webhook tidak jalan
- Pastikan URL webhook sudah dikonfigurasi di dashboard Midtrans
- Check log Laravel: `tail -f storage/logs/laravel.log`
- Verify signature di `OrderController::notification()`

### 3. Payment status tidak update
- Check apakah webhook terkirim (lihat di dashboard Midtrans → Transactions)
- Pastikan route `/api/midtrans/notification` accessible (tidak perlu auth)

### 4. Snap popup tidak muncul
- Pastikan `VITE_MIDTRANS_CLIENT_KEY` sudah di set di frontend `.env`
- Check console browser untuk error script loading
- Verify snap.js loaded: `window.snap`

---

## 📚 Dokumentasi Resmi

- **Midtrans Docs:** https://docs.midtrans.com/
- **Snap Integration:** https://docs.midtrans.com/en/snap/integration-guide
- **API Reference:** https://api-docs.midtrans.com/
- **Sandbox Dashboard:** https://dashboard.sandbox.midtrans.com/
- **Production Dashboard:** https://dashboard.midtrans.com/

---

## 💡 Fitur Tambahan yang Bisa Dikembangkan

1. **Email notification** saat payment success/failed
2. **SMS notification** via Twilio/Nexmo
3. **Export laporan** pembayaran (Excel/PDF)
4. **Recurring payment** untuk subscription bulanan
5. **Installment** (cicilan kartu kredit)
6. **Promo code / discount** system

---

## 📞 Support

Jika ada masalah:
- Email: support@midtrans.com
- Phone: +62 21 2986 0780
- Slack: Midtrans Developer Community

---

**Developed by:** TenagaAhli.com Development Team  
**Last Updated:** July 23, 2026  
**Version:** 1.0.0
