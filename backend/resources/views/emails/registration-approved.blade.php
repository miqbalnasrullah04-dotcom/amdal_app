<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pendaftaran Disetujui</title>
    <style>
        body { margin: 0; padding: 0; background: #f4f7fb; font-family: 'Segoe UI', Arial, sans-serif; color: #1F2A22; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%); padding: 36px 40px; text-align: center; }
        .header-icon { width: 72px; height: 72px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 4px; }
        .header p { color: rgba(255,255,255,0.8); font-size: 14px; margin: 0; }
        .brand { color: #7DD3FC; font-weight: 800; }
        .body { padding: 36px 40px; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.7; color: #414844; margin-bottom: 16px; }
        .badge { display: inline-block; background: #DCFCE7; color: #166534; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 100px; margin-bottom: 24px; }
        .info-box { background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px; }
        .info-box p { font-size: 13px; color: #075985; margin: 0; line-height: 1.7; }
        .cta-btn { display: block; background: linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%); color: #ffffff !important; text-decoration: none; text-align: center; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 10px; margin-bottom: 28px; }
        .divider { height: 1px; background: #E8EDEC; margin: 24px 0; }
        .footer { padding: 20px 40px 28px; text-align: center; }
        .footer p { font-size: 12px; color: #9AA4A1; margin: 0 0 4px; }
        .steps { margin: 20px 0; }
        .step { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
        .step-num { flex-shrink: 0; width: 28px; height: 28px; background: #0EA5E9; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .step-text { font-size: 13px; color: #414844; line-height: 1.6; padding-top: 4px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <div style="margin-bottom:16px;">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;">
                    <circle cx="28" cy="28" r="28" fill="rgba(255,255,255,0.2)"/>
                    <path d="M18 28.5L24.5 35L38 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h1>Pendaftaran Disetujui!</h1>
            <p>Selamat bergabung di <span class="brand">TenagaAhli.com</span></p>
        </div>

        <div class="body">
            <p class="greeting">Halo, {{ $expert->name }}!</p>

            <span class="badge">✓ Akun Aktif</span>

            <p class="text">
                Kami dengan senang hati memberitahukan bahwa pendaftaran Anda sebagai
                <strong>Tenaga Ahli</strong> di TenagaAhli.com telah <strong>diverifikasi dan disetujui</strong>
                oleh tim kami.
            </p>

            <div class="info-box">
                <p>
                    Akun Anda sudah aktif dan siap digunakan. Anda sekarang dapat masuk ke dashboard,
                    melengkapi profil, memilih paket, dan mempublikasikan profil Anda kepada calon klien.
                </p>
            </div>

            <p class="text" style="font-weight:600; margin-bottom:12px;">Langkah berikutnya:</p>
            <div class="steps">
                <div class="step">
                    <div class="step-num">1</div>
                    <div class="step-text">Masuk ke akun menggunakan email dan kata sandi yang Anda daftarkan.</div>
                </div>
                <div class="step">
                    <div class="step-num">2</div>
                    <div class="step-text">Lengkapi profil Anda: tambahkan riwayat pendidikan, pengalaman, dan sertifikat.</div>
                </div>
                <div class="step">
                    <div class="step-num">3</div>
                    <div class="step-text">Pilih paket (Free atau Premium) untuk mempublikasikan profil Anda.</div>
                </div>
            </div>

            <a href="{{ $loginUrl }}" class="cta-btn">Masuk ke Dashboard Sekarang</a>

            <div class="divider"></div>

            <p class="text" style="font-size:13px; color:#9AA4A1;">
                Jika Anda tidak merasa mendaftar di platform ini, abaikan email ini atau hubungi kami di
                <a href="mailto:{{ config('mail.from.address') }}" style="color:#0284C7;">{{ config('mail.from.address') }}</a>.
            </p>
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} TenagaAhli.com — System Dynamics Center</p>
            <p>Email ini dikirim secara otomatis, mohon tidak membalas.</p>
        </div>
    </div>
</body>
</html>
