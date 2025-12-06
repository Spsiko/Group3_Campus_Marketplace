import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { getUser } from "../lib/auth";
import "../style/NotificationBell.scss";
export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const bellRef = useRef(null);
    const user = getUser();
    const userId = user?.id; // auth.ts stores DB user.id here
    // -------------------------------------------------------
    // 1. FETCH NOTIFICATIONS
    // -------------------------------------------------------
    async function fetchNotifications() {
        if (!userId)
            return;
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
        if (!userId)
            return;
        fetchNotifications(); // initial load
        const channel = supabase
            .channel("student-notif-realtime")
            .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "student_notifications",
            filter: `user_id=eq.${userId}`,
        }, (payload) => {
            setNotifications((prev) => [payload.new, ...prev]);
        })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);
    // -------------------------------------------------------
    // 3. CLICK OUTSIDE → CLOSE DROPDOWN
    // -------------------------------------------------------
    useEffect(() => {
        const handler = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
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
        if (!userId)
            return;
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
    return (_jsxs("div", { className: "notification-wrapper", ref: bellRef, children: [_jsxs("button", { className: "notification-bell", onClick: () => setOpen(!open), children: [_jsx(Bell, { size: 22, color: "#1f2937" }), unreadCount > 0 && (_jsx("span", { className: "notification-badge", children: unreadCount }))] }), open && (_jsxs("div", { className: "notification-dropdown", children: [_jsxs("div", { className: "notification-header", children: [_jsx("span", { children: "Notifications" }), unreadCount > 0 && (_jsx("button", { className: "mark-read-btn", onClick: markAllRead, children: "Mark all read" }))] }), _jsxs("div", { className: "notification-list", children: [notifications.length === 0 && (_jsx("div", { className: "notification-empty", children: "No notifications" })), notifications.map((n) => (_jsxs("div", { className: `notification-item ${!n.read ? "unread" : ""}`, children: [_jsx("strong", { children: n.title }), _jsx("p", { children: n.message }), _jsx("span", { className: "notification-time", children: new Date(n.created_at).toLocaleString() })] }, n.id)))] })] }))] }));
}
