<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Informasi Hasil Verifikasi</title>
    <style>
        body { margin: 0; padding: 0; background: #f4f7fb; font-family: 'Segoe UI', Arial, sans-serif; color: #1F2A22; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%); padding: 36px 40px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 4px; }
        .header p { color: rgba(255,255,255,0.8); font-size: 14px; margin: 0; }
        .brand-link { color: #FCA5A5; font-weight: 800; }
        .body { padding: 36px 40px; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.7; color: #414844; margin-bottom: 16px; }
        .reason-box { background: #FFF1F2; border: 1px solid #FECDD3; border-left: 4px solid #DC2626; border-radius: 0 12px 12px 0; padding: 16px 20px; margin-bottom: 24px; }
        .reason-box .label { font-size: 11px; font-weight: 700; color: #DC2626; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .reason-box p { font-size: 14px; color: #7F1D1D; margin: 0; line-height: 1.6; font-weight: 500; }
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
                    <path d="M20 20L36 36M36 20L20 36" stroke="white" stroke-width="3" stroke-linecap="round"/>
                </svg>
            </div>
            <h1>Perlu Perbaikan Data</h1>
            <p><span class="brand-link">TenagaAhli.com</span> — Notifikasi Verifikasi</p>
        </div>

        <div class="body">
            <p class="greeting">Halo, {{ $expert->name }}!</p>

            <p class="text">
                Terima kasih telah mendaftar di TenagaAhli.com. Setelah tim kami meninjau data dan dokumen
                yang Anda kirimkan, terdapat <strong>beberapa hal yang perlu diperbaiki</strong> sebelum
                akun Anda dapat diaktifkan.
            </p>

            @if($rejectReason)
            <div class="reason-box">
                <div class="label">Catatan dari Admin</div>
                <p>{{ $rejectReason }}</p>
            </div>
            @else
            <div class="reason-box">
                <div class="label">Catatan dari Admin</div>
                <p>Data atau dokumen yang diunggah belum memenuhi syarat. Silakan periksa kembali kelengkapan dokumen Anda.</p>
            </div>
            @endif

            <div class="info-box">
                <p>
                    Jangan khawatir — Anda dapat mendaftar ulang dengan melengkapi dan memperbaiki
                    data sesuai catatan di atas. Proses pendaftaran bisa diulang kapan saja melalui halaman pendaftaran.
                </p>
            </div>

            <p class="text" style="font-weight:600; margin-bottom:12px;">Cara mendaftar ulang:</p>
            <div class="steps">
                <div class="step">
                    <div class="step-num">1</div>
                    <div class="step-text">Buka halaman pendaftaran melalui tombol di bawah.</div>
                </div>
                <div class="step">
                    <div class="step-num">2</div>
                    <div class="step-text">Isi formulir dengan data yang sudah diperbaiki sesuai catatan admin.</div>
                </div>
                <div class="step">
                    <div class="step-num">3</div>
                    <div class="step-text">Unggah ulang dokumen (CV, pas foto, bukti kompetensi) yang valid.</div>
                </div>
                <div class="step">
                    <div class="step-num">4</div>
                    <div class="step-text">Kirim pendaftaran dan tunggu verifikasi kembali dari tim kami.</div>
                </div>
            </div>

            <a href="{{ $registerUrl }}" class="cta-btn">Daftar Ulang Sekarang</a>

            <div class="divider"></div>

            <p class="text" style="font-size:13px; color:#9AA4A1;">
                Ada pertanyaan? Hubungi kami di
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
