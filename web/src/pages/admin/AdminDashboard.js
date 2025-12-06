import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../style/admindashboard.scss";
export default function AdminDashboard() {
    const [totalUsers, setTotalUsers] = useState(null);
    const [totalPosts, setTotalPosts] = useState(null);
    const [engagementRate, setEngagementRate] = useState(null);
    const [revenue, setRevenue] = useState(null);
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        const loadDashboard = async () => {
            // ---------- TOTAL USERS ----------
            let totalUsersCount = 0;
            const { count: usersCount, error: usersError, } = await supabase
                .from("users") // change if your users table is named differently
                .select("*", { head: true, count: "exact" });
            if (!usersError) {
                totalUsersCount = usersCount ?? 0;
                setTotalUsers(totalUsersCount);
            }
            else {
                console.error("Error loading users:", usersError);
            }
            // ---------- TOTAL POSTS (LISTINGS) ----------
            const { count: postsCount, error: postsError, } = await supabase
                .from("listings") // change to your listings table name if needed
                .select("*", { head: true, count: "exact" });
            if (!postsError) {
                setTotalPosts(postsCount ?? 0);
            }
            else {
                console.error("Error loading posts:", postsError);
            }
            // ---------- ENGAGEMENT RATE ----------
            // % of users who created at least 1 listing in last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const { data: recentListings, error: recentListingsError, } = await supabase
                .from("listings")
                .select("seller_id, created_at")
                .gte("created_at", thirtyDaysAgo.toISOString());
            if (!recentListingsError && recentListings && totalUsersCount > 0) {
                const activeUserIds = new Set(recentListings
                    .map((row) => row.seller_id)
                    .filter((id) => id !== null));
                const activeUsersCount = activeUserIds.size;
                const rate = totalUsersCount > 0
                    ? (activeUsersCount / totalUsersCount) * 100
                    : 0;
                setEngagementRate(rate);
            }
            else if (recentListingsError) {
                console.error("Error loading engagement data:", recentListingsError);
                setEngagementRate(0);
            }
            // ---------- REVENUE ----------
            // Sum of price for all listings with status = 'sold'
            const { data: soldListings, error: revenueError, } = await supabase
                .from("listings")
                .select("price, status")
                .eq("status", "sold");
            if (!revenueError && soldListings) {
                const totalRevenue = soldListings.reduce((sum, row) => sum + (row.price ?? 0), 0);
                setRevenue(totalRevenue);
            }
            else if (revenueError) {
                console.error("Error loading revenue data:", revenueError);
                setRevenue(0);
            }
            // ---------- RECENT ACTIVITY / NOTIFICATIONS ----------
            const { data: notifData, error: notifError } = await supabase
                .from("notifications")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(4);
            if (!notifError && notifData) {
                setNotifications(notifData.map((n) => ({
                    id: n.id,
                    user_name: n.user_name,
                    action: n.action,
                    status: n.status,
                    created_at: n.created_at,
                })));
            }
            else if (notifError) {
                console.error("Error loading notifications:", notifError);
            }
        };
        loadDashboard();
    }, []);
    const statusToBadgeClass = {
        active: "ok",
        warning: "warn",
        error: "danger",
    };
    return (_jsxs("section", { className: "dash", children: [_jsx("div", { className: "dash-header", children: _jsx("h1", { children: "Dashboard" }) }), _jsxs("div", { className: "kpi-grid", children: [_jsxs("div", { className: "kpi card", children: [_jsx("div", { className: "kpi-title", children: "Total Users" }), _jsx("div", { className: "kpi-value", children: totalUsers !== null ? totalUsers.toLocaleString() : "…" }), _jsx("div", { className: "kpi-delta up", children: "Currently registered users" })] }), _jsxs("div", { className: "kpi card", children: [_jsx("div", { className: "kpi-title", children: "Total Posts" }), _jsx("div", { className: "kpi-value", children: totalPosts !== null ? totalPosts.toLocaleString() : "…" }), _jsx("div", { className: "kpi-delta up", children: "All posts created so far" })] }), _jsxs("div", { className: "kpi card", children: [_jsx("div", { className: "kpi-title", children: "Engagement Rate" }), _jsx("div", { className: "kpi-value", children: engagementRate !== null
                                    ? `${engagementRate.toFixed(1)}%`
                                    : "…" }), _jsx("div", { className: "kpi-delta up", children: "Active users in the last 30 days" })] }), _jsxs("div", { className: "kpi card", children: [_jsx("div", { className: "kpi-title", children: "Revenue" }), _jsx("div", { className: "kpi-value", children: revenue !== null
                                    ? `$${revenue.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}`
                                    : "…" }), _jsx("div", { className: "kpi-delta up", children: "Total value of sold items" })] })] }), _jsxs("div", { className: "card activity", children: [_jsx("div", { className: "activity-title", children: "Recent Activity" }), notifications.map((n) => (_jsxs("div", { className: "row", children: [_jsxs("div", { children: [_jsx("b", { children: n.user_name }), " ", n.action, _jsx("div", { className: "time", children: new Date(n.created_at).toLocaleString() })] }), _jsx("span", { className: `badge ${statusToBadgeClass[n.status]}`, children: n.status })] }, n.id))), notifications.length === 0 && (_jsx("div", { className: "row", children: _jsx("div", { children: "No recent activity yet." }) }))] })] }));
}
