import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getUser } from "../../lib/auth";
export default function SellerDashboard() {
    const [sellerId, setSellerId] = useState(null);
    const [requested, setRequested] = useState([]);
    const [paid, setPaid] = useState([]);
    const [completed, setCompleted] = useState([]);
    // -------------------------------
    // Load seller profile (users.id)
    // -------------------------------
    useEffect(() => {
        const u = getUser();
        if (!u?.id)
            return;
        // u.id = users.id (correct key)
        setSellerId(u.id);
    }, []);
    // -------------------------------
    // Fetch orders that contain this seller's items
    // -------------------------------
    useEffect(() => {
        if (!sellerId)
            return;
        async function loadOrders() {
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) {
                console.error("ORDER FETCH ERROR:", error);
                return;
            }
            const orders = data;
            // Filter each order → keep only items belonging to this seller
            const sellerRequested = [];
            const sellerPaid = [];
            const sellerCompleted = [];
            for (const order of orders) {
                if (!order.items)
                    continue;
                for (const item of order.items) {
                    if (item.seller_id !== sellerId)
                        continue;
                    const view = {
                        order_id: order.order_id,
                        status: order.status,
                        created_at: order.created_at,
                        title: item.title,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image,
                    };
                    if (order.status === "requested") {
                        sellerRequested.push(view);
                    }
                    else if (order.status === "paid") {
                        sellerPaid.push(view);
                    }
                    else if (order.status === "completed") {
                        sellerCompleted.push(view);
                    }
                }
            }
            setRequested(sellerRequested);
            setPaid(sellerPaid);
            setCompleted(sellerCompleted);
        }
        loadOrders();
        // -------------------------------
        // Realtime updates for sellers
        // -------------------------------
        const channel = supabase
            .channel("seller-dashboard-updates")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => loadOrders())
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => loadOrders())
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [sellerId]);
    // -------------------------------
    // RENDER LIST UI
    // -------------------------------
    function renderList(title, items) {
        return (_jsxs("section", { style: { marginTop: "30px" }, children: [_jsx("h2", { children: title }), items.length === 0 && _jsx("p", { children: "No items found." }), items.map((i, idx) => (_jsxs("div", { className: "order-card", style: {
                        padding: "12px",
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        marginBottom: "10px",
                        display: "flex",
                        gap: "16px",
                        alignItems: "center",
                    }, children: [_jsx("img", { src: i.image, alt: i.title, style: { width: "90px", borderRadius: "8px" } }), _jsxs("div", { children: [_jsx("strong", { children: i.title }), _jsxs("p", { children: ["$", i.price, " \u00D7 ", i.quantity] }), _jsxs("small", { children: ["Order: ", i.order_id] }), _jsx("br", {}), _jsxs("small", { children: ["Date: ", new Date(i.created_at).toLocaleString()] })] })] }, idx)))] }));
    }
    return (_jsxs("div", { style: { padding: "20px" }, children: [_jsx("h1", { children: "Seller Dashboard" }), _jsx("p", { children: "View orders that include your listed products." }), renderList("Requested Orders", requested), renderList("Paid Orders", paid), renderList("Completed / Sold Orders", completed)] }));
}
