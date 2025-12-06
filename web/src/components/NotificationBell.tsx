import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { getUser } from "../lib/auth";
import "../style/NotificationBell.scss";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const bellRef = useRef<HTMLDivElement>(null);

  const user = getUser();
  const userId = user?.id; // auth.ts stores DB user.id here

  // -------------------------------------------------------
  // 1. FETCH NOTIFICATIONS
  // -------------------------------------------------------
  async function fetchNotifications() {
    if (!userId) return;

    const { data, error } = await supabase
      .from("student_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
  }

  // -------------------------------------------------------
  // 2. REALTIME SUBSCRIPTION (LISTEN FOR NEW NOTIFICATIONS)
  // -------------------------------------------------------
  useEffect(() => {
    if (!userId) return;

    fetchNotifications(); // initial load

    const channel = supabase
      .channel("student-notif-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "student_notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // -------------------------------------------------------
  // 3. CLICK OUTSIDE → CLOSE DROPDOWN
  // -------------------------------------------------------
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -------------------------------------------------------
  // 4. UNREAD COUNT
  // -------------------------------------------------------
  const unreadCount = notifications.filter((n) => !n.read).length;

  // -------------------------------------------------------
  // 5. MARK ALL READ
  // -------------------------------------------------------
  async function markAllRead() {
    if (!userId) return;

    await supabase
      .from("student_notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    fetchNotifications();
  }

  // -------------------------------------------------------
  // 6. UI
  // -------------------------------------------------------
  return (
    <div className="notification-wrapper" ref={bellRef}>
      <button className="notification-bell" onClick={() => setOpen(!open)}>
        <Bell size={22} color="#1f2937" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="mark-read-btn" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 && (
              <div className="notification-empty">No notifications</div>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${!n.read ? "unread" : ""}`}
              >
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <span className="notification-time">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
