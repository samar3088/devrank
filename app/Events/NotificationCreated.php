<?php

namespace App\Events;

use App\Models\UserNotification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Pushes a freshly-created in-app notification to its owner over WebSocket
 * (Reverb). ShouldBroadcastNow = no queue worker needed. This is an ADDITIVE
 * layer on top of the 45s polling: when broadcasting isn't configured
 * (BROADCAST_CONNECTION=log/null, the default), it's a harmless no-op and the
 * bell still updates via polling.
 */
class NotificationCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public UserNotification $notification) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('notifications.' . $this->notification->user_id);
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id'         => $this->notification->id,
            'type'       => $this->notification->type,
            'title'      => $this->notification->title,
            'body'       => $this->notification->body,
            'url'        => $this->notification->url,
            'icon'       => $this->notification->icon,
            'created_at' => $this->notification->created_at?->toIso8601String(),
        ];
    }
}
