// src/components/NotificationBell.tsx
import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { getUser } from "../lib/auth";
import "../style/NotificationBell.scss";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const bellRef = useRef<HTMLDivElement>(null);

  const authUser = getUser();
  const userId = authUser?.id;

  // -------------------------------------------------------
  // Fetch notifications
  // -------------------------------------------------------
  async function fetchNotifications() {
    if (!userId) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return;
    }

    setNotifications(data || []);
  }

  // -------------------------------------------------------
  // Realtime subscription (FINAL FIX)
  // -------------------------------------------------------
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    const channel = supabase
      .channel(`notif-${userId}`) // user-specific channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`, // server-side filtering
        },
        (payload) => {
          const newRow = payload.new;
          if (!newRow) return;

          console.log("Realtime NOTIFICATION received:", newRow);

          // Add instantly to UI
          setNotifications((prev) => [newRow, ...prev]);
        }
      )
      .subscribe((status) => {
        console.log("Realtime Notifications Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // -------------------------------------------------------
  // Close dropdown when clicking outside
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
  // Unread count
  // -------------------------------------------------------
  const unreadCount = notifications.filter((n) => n.status === "active").length;

  // -------------------------------------------------------
  // Mark notifications as read
  // -------------------------------------------------------
  async function markAllRead() {
    if (!userId) return;

    const { error } = await supabase
      .from("notifications")
      .update({ status: "inactive" })
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) {
      console.error("Failed to mark notifications read:", error);
      return;
    }

    fetchNotifications();
  }

  return (
    <div className="notification-wrapper" ref={bellRef}>
      <button className="notification-bell" onClick={() => setOpen(!open)}>
        <Bell size={22} />
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
                className={`notification-item ${
                  n.status === "active" ? "unread" : ""
                }`}
              >
                <p>{n.action}</p>
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
