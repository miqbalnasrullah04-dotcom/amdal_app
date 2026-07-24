<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpVerification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $otpCode,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kode Verifikasi Email - ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp-verification',
            with: [
                'otpCode' => $this->otpCode,
            ]
        );
    }
}
