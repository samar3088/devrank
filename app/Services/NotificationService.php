<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserNotification;

/**
 * In-app notification center. Notifications are stored in `user_notifications`
 * and surfaced via a polling bell in the nav (no websocket infra needed for
 * phase 1 — Reverb/Echo can be layered on later without changing this model).
 */
class NotificationService
{
    /** Create a notification for a user. Self-notifications are skipped. */
    public function notify(
        int|User $user,
        string $type,
        string $title,
        ?string $body = null,
        ?string $url = null,
        ?string $icon = null,
        ?int $actorId = null,
    ): ?UserNotification {
        $userId = $user instanceof User ? $user->id : $user;

        // Never notify someone about their own action.
        if ($actorId !== null && $actorId === $userId) {
            return null;
        }

        $notification = UserNotification::create([
            'user_id' => $userId,
            'type'    => $type,
            'title'   => $title,
            'body'    => $body,
            'url'     => $url,
            'icon'    => $icon,
        ]);

        // Best-effort real-time push (Reverb). Never let a broadcast issue break
        // the notification write — the DB row is the source of truth and polling
        // still delivers it. No-op when broadcasting isn't configured.
        try {
            event(new \App\Events\NotificationCreated($notification));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Notification broadcast failed: ' . $e->getMessage());
        }

        return $notification;
    }

    /**
     * Notify every admin (super + sub). Used for moderation events so the admin
     * nav bell surfaces things that need a human — not just an empty bell.
     */
    public function notifyAdmins(
        string $type,
        string $title,
        ?string $body = null,
        ?string $url = null,
        ?string $icon = null,
    ): void {
        User::role(['super_admin', 'sub_admin'])->pluck('id')->each(
            fn ($id) => $this->notify($id, $type, $title, $body, $url, $icon)
        );
    }

    public function unreadCount(int $userId): int
    {
        return UserNotification::where('user_id', $userId)->unread()->count();
    }

    /** Recent notifications for the bell dropdown. */
    public function recent(int $userId, int $limit = 12)
    {
        return UserNotification::where('user_id', $userId)
            ->latest()
            ->limit($limit)
            ->get();
    }

    /** Paginated feed for the notifications page. */
    public function paginated(int $userId, int $perPage = 20)
    {
        return UserNotification::where('user_id', $userId)
            ->latest()
            ->paginate($perPage);
    }

    public function markRead(UserNotification $notification): void
    {
        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }
    }

    public function markAllRead(int $userId): void
    {
        UserNotification::where('user_id', $userId)->unread()->update(['read_at' => now()]);
    }
}
