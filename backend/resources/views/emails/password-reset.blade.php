<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1479D6 0%, #0F63B0 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Reset Password</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">TenagaAhli.com</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                                Halo,
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                                Kami menerima permintaan untuk mereset password akun Anda di TenagaAhli.com.
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                                Gunakan kode OTP berikut untuk mereset password Anda:
                            </p>
                            
                            <!-- OTP Code -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <div style="background-color: #f0f7ff; border: 2px dashed #1479D6; border-radius: 8px; padding: 20px; display: inline-block;">
                                            <span style="color: #1479D6; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">{{ $token }}</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0 20px 0;">
                                Kode OTP ini berlaku selama <strong>15 menit</strong>.
                            </p>
                            <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 0 0 20px 0;">
                                Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tidak akan berubah.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="color: #6c757d; font-size: 14px; line-height: 20px; margin: 0 0 10px 0;">
                                Email ini dikirim secara otomatis, mohon tidak membalas email ini.
                            </p>
                            <p style="color: #6c757d; font-size: 12px; margin: 0;">
                                &copy; 2026 TenagaAhli.com. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
