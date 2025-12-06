import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/student/StudentOrders.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getUser } from "../../lib/auth";
import { useNavigate } from "react-router-dom";
import "../../style/StudentOrders.scss";
export default function StudentOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        async function load() {
            const user = getUser();
            if (!user || !user.id) {
                navigate("/login");
                return;
            }
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("buyer_id", user.id)
                .order("created_at", { ascending: false });
            if (!error && data) {
                const mapped = data.map((row) => ({
                    ...row,
                    items: Array.isArray(row.items) ? row.items : [],
                }));
                setOrders(mapped);
            }
            setLoading(false);
        }
        load();
    }, [navigate]);
    if (loading) {
        return _jsx("div", { className: "orders-page", children: "Loading your orders\u2026" });
    }
    if (!orders.length) {
        return (_jsxs("div", { className: "orders-page", children: [_jsx("h1", { children: "My Orders" }), _jsx("p", { className: "orders-empty", children: "You have not placed any orders yet." })] }));
    }
    return (_jsxs("div", { className: "orders-page", children: [_jsx("h1", { children: "My Orders" }), _jsx("div", { className: "orders-list", children: orders.map((order) => (_jsxs("div", { className: "order-card", children: [_jsxs("div", { className: "order-card__header", children: [_jsxs("div", { children: [_jsxs("div", { className: "order-card__id", children: ["Order #", order.order_id || order.id.slice(0, 8)] }), _jsxs("div", { className: "order-card__meta", children: ["Placed on", " ", new Date(order.created_at).toLocaleString()] })] }), _jsxs("div", { className: "order-card__status", children: [_jsx("span", { className: `badge badge--${order.status}`, children: order.status }), _jsxs("div", { className: "order-card__amount", children: ["$", Number(order.total_amount || 0).toFixed(2)] })] })] }), _jsx("div", { className: "order-card__items", children: order.items.map((item, idx) => (_jsxs("div", { className: "order-item", children: [_jsx("div", { className: "order-item__title", children: item.title }), _jsxs("div", { className: "order-item__qty", children: ["Qty: ", item.quantity || 1] }), _jsxs("div", { className: "order-item__price", children: ["$", Number(item.price || 0).toFixed(2)] })] }, item.listing_id + idx))) }), order.payment_method && (_jsxs("div", { className: "order-card__footer", children: ["Payment: ", order.payment_method] }))] }, order.id))) })] }));
}
