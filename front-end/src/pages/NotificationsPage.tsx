import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { Heart, MessageCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL as API_BASE } from "@/lib/config";

const PRIMARY_GRADIENT =
  "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";

// 🔔 Map backend notification types → icons
const TYPE_MAP: Record<string, any> = {
  MATCH_CREATED: {
    icon: Star,
    color: "text-[#00C98B]",
    bg: "bg-[#00C98B]/10",
  },
  MESSAGE_RECEIVED: {
    icon: MessageCircle,
    color: "text-[#00B4D8]",
    bg: "bg-[#00B4D8]/10",
  },
  PROFILE_LIKED: {
    icon: Heart,
    color: "text-[#0095E0]",
    bg: "bg-[#0095E0]/10",
  },
};

type Notification = {
  id: number;
  type: string;
  match_id: number | null;
  chat_id: number | null;
  other_user: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage({
  onLogout,
}: {
  onLogout?: () => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔑 Get JWT token
  const token = localStorage.getItem("access_token");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 📥 Fetch notifications
  const fetchNotifications = async () => {
    if (!token) {
      console.warn("No access token found");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/notifications/`, {
        method: "GET",
        headers: authHeaders,
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch notifications (${res.status})`);
      }

      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark single notification as read
  const markAsRead = async (id: number) => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/notifications/read/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ notification_id: id }),
      });

      if (!res.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/notifications/read-all/`, {
        method: "POST",
        headers: authHeaders,
      });

      if (!res.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  // ⏱ Time formatter
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  };

  // 🔁 Initial load
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-20 pb-10">
      <TopBar onLogout={onLogout} />

      <main className="container mx-auto max-w-3xl px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Notifications
          </h1>

          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm font-semibold text-[#0095E0] hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-gray-400">
            No notifications yet
          </p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => {
              const meta =
                TYPE_MAP[notif.type] || TYPE_MAP.MATCH_CREATED;
              const Icon = meta.icon;

              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-300 cursor-pointer",
                    !notif.is_read && "hover:shadow-md"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                      meta.bg
                    )}
                  >
                    <Icon className={cn("w-6 h-6", meta.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-bold">
                        {notif.other_user ?? "Someone"}
                      </span>{" "}
                      {notif.type === "MATCH_CREATED" &&
                        "matched with you 🎉"}
                    </p>
                    <span className="text-xs text-gray-400 font-medium">
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>

                  {/* Unread Dot */}
                  {!notif.is_read && (
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${PRIMARY_GRADIENT}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
