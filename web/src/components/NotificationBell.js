import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/NotificationBell.tsx
import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { getUser } from "../lib/auth";
import "../style/NotificationBell.scss";
export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const bellRef = useRef(null);
    const authUser = getUser();
    const userId = authUser?.id;
    // -------------------------------------------------------
    // Fetch notifications
    // -------------------------------------------------------
    async function fetchNotifications() {
        if (!userId)
            return;
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
    // Realtime subscription
    // -------------------------------------------------------
    useEffect(() => {
        if (!userId)
            return;
        fetchNotifications();
        const channel = supabase
            .channel("notifications-realtime")
            .on("postgres_changes", {
            event: "*", // catch INSERT + UPDATE
            schema: "public",
            table: "notifications",
        }, (payload) => {
            const newRow = payload.new;
            if (!newRow)
                return;
            // Only show notifications belonging to this user
            if (newRow.user_id === userId) {
                setNotifications((prev) => [newRow, ...prev]);
            }
        })
            .subscribe((status) => {
            console.log("Realtime status:", status);
        });
        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);
    // -------------------------------------------------------
    // Close dropdown when clicking outside
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
    // Unread count
    // -------------------------------------------------------
    const unreadCount = notifications.filter((n) => n.status === "active").length;
    // -------------------------------------------------------
    // Mark notifications as read
    // -------------------------------------------------------
    async function markAllRead() {
        if (!userId)
            return;
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
    return (_jsxs("div", { className: "notification-wrapper", ref: bellRef, children: [_jsxs("button", { className: "notification-bell", onClick: () => setOpen(!open), children: [_jsx(Bell, { size: 22 }), unreadCount > 0 && (_jsx("span", { className: "notification-badge", children: unreadCount }))] }), open && (_jsxs("div", { className: "notification-dropdown", children: [_jsxs("div", { className: "notification-header", children: [_jsx("span", { children: "Notifications" }), unreadCount > 0 && (_jsx("button", { className: "mark-read-btn", onClick: markAllRead, children: "Mark all read" }))] }), _jsxs("div", { className: "notification-list", children: [notifications.length === 0 && (_jsx("div", { className: "notification-empty", children: "No notifications" })), notifications.map((n) => (_jsxs("div", { className: `notification-item ${n.status === "active" ? "unread" : ""}`, children: [_jsx("p", { children: n.action }), _jsx("span", { className: "notification-time", children: new Date(n.created_at).toLocaleString() })] }, n.id)))] })] }))] }));
}
