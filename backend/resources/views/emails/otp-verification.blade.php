<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verifikasi Email</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; background-color: #ffffff; padding: 30px; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #0284C7; text-align: center;">Verifikasi Email Anda</h2>
        <p style="color: #333333; font-size: 16px;">Terima kasih telah mendaftar di <strong>TenagaAhli.com</strong>. Untuk melanjutkan proses pendaftaran, silakan gunakan kode OTP berikut untuk memverifikasi alamat email Anda:</p>
        
        <div style="background-color: #f0f9ff; border: 2px dashed #0EA5E9; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0284C7;">{{ $otpCode }}</span>
        </div>
        
        <p style="color: #666666; font-size: 14px;"><em>* Kode ini hanya berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.</em></p>
        
        <p style="color: #333333; font-size: 16px; margin-top: 30px;">Jika Anda tidak merasa mendaftar di TenagaAhli.com, silakan abaikan email ini.</p>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
        <p style="color: #999999; font-size: 12px; text-align: center;">&copy; {{ date('Y') }} TenagaAhli.com. All rights reserved.</p>
    </div>
</body>
</html>
