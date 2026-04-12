<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $token
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = url("/reset-password/{$this->token}?email={$notifiable->email}");

        return (new MailMessage)
            ->subject('Reset Your DevRank Password')
            ->greeting("Hello, {$notifiable->name}!")
            ->line('We received a password reset request for your DevRank account.')
            ->action('Reset Password', $url)
            ->line('This link will expire in 60 minutes.')
            ->line('If you didn\'t request this, you can safely ignore this email — your password will remain unchanged.')
            ->salutation("Stay sharp,\nThe DevRank Team");
    }
}