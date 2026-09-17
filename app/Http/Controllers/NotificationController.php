<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $notifications) {}

    /** Full notifications page. */
    public function index(Request $request)
    {
        return Inertia::render('Notifications/Index', [
            'notifications' => $this->notifications->paginated($request->user()->id),
        ]);
    }

    /** Lightweight JSON feed polled by the nav bell. */
    public function feed(Request $request)
    {
        $userId = $request->user()->id;

        return response()->json([
            'unread' => $this->notifications->unreadCount($userId),
            'items'  => $this->notifications->recent($userId),
        ]);
    }

    public function markRead(Request $request, UserNotification $notification)
    {
        abort_unless($notification->user_id === $request->user()->id, 403);
        $this->notifications->markRead($notification);

        return back();
    }

    public function markAllRead(Request $request)
    {
        $this->notifications->markAllRead($request->user()->id);

        return back();
    }
}
