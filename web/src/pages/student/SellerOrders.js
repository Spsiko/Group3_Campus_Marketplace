import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/student/SellerOrders.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUser } from "../../lib/resolvedUser";
import "../../style/SellerOrders.scss";
export default function SellerOrders() {
    const [authUser, setAuthUser] = useState(null);
    const [sellerOrders, setSellerOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function load() {
            const user = await getResolvedUser();
            setAuthUser(user || null);
        }
        load();
    }, []);
    useEffect(() => {
        if (!authUser?.auth_user_id)
            return;
        async function fetchSellerOrders() {
            setLoading(true);
            // First join: order_item + listings + orders
            const { data, error } = await supabase
                .from("order_item")
                .select(`
          id,
          quantity,
          price,
          total_amount,
          created_at,
          listing:listing_id (
            id,
            title,
            status,
            image_urls
          ),
          order:order_id (
            order_id,
            buyer_id,
            status,
            created_at
          )
        `)
                .eq("seller_id", authUser.auth_user_id)
                .order("created_at", { ascending: false });
            if (error) {
                console.error("Seller Orders Load Error:", error);
                setSellerOrders([]);
                setLoading(false);
                return;
            }
            // Fetch buyer names in parallel
            const formatted = await Promise.all((data || []).map(async (row) => {
                let buyer = null;
                if (row.order?.buyer_id) {
                    const { data: buyerRow } = await supabase
                        .from("users")
                        .select("full_name, email")
                        .eq("id", row.order.buyer_id)
                        .maybeSingle();
                    buyer = buyerRow || null;
                }
                return {
                    orderId: row.order?.order_id,
                    orderStatus: row.order?.status,
                    orderDate: row.order?.created_at,
                    buyerName: buyer?.full_name ?? "Unknown",
                    buyerEmail: buyer?.email ?? "Unknown",
                    title: row.listing?.title,
                    productStatus: row.listing?.status,
                    image: row.listing?.image_urls?.[0] ?? "/placeholder.jpg",
                    quantity: row.quantity,
                    price: row.price,
                    total: row.total_amount,
                };
            }));
            setSellerOrders(formatted);
            setLoading(false);
        }
        fetchSellerOrders();
    }, [authUser]);
    // ---------------- UI ----------------
    return (_jsxs("div", { className: "seller-orders-page", children: [_jsx("h2", { children: "Orders Received" }), loading ? (_jsx("p", { children: "Loading..." })) : sellerOrders.length === 0 ? (_jsx("p", { children: "No sold items yet." })) : (_jsx("div", { className: "orders-list", children: sellerOrders.map((item, i) => (_jsxs("div", { className: "order-card", children: [_jsxs("div", { className: "order-header", children: [_jsx("h3", { children: item.title }), _jsx("span", { className: "status-badge", children: item.productStatus })] }), _jsxs("div", { className: "order-meta", children: [_jsxs("p", { children: [_jsx("strong", { children: "Order #:" }), " ", item.orderId] }), _jsxs("p", { children: [_jsx("strong", { children: "Buyer:" }), " ", item.buyerName, " (", item.buyerEmail, ")"] }), _jsxs("p", { children: [_jsx("strong", { children: "Status:" }), " ", item.orderStatus] }), _jsxs("p", { children: [_jsx("strong", { children: "Date:" }), " ", new Date(item.orderDate).toLocaleString()] })] }), _jsxs("div", { className: "order-items", children: [_jsx("strong", { children: "Sold Item" }), _jsxs("p", { children: ["Qty: ", item.quantity] }), _jsxs("p", { children: ["Price: $", Number(item.price).toFixed(2)] })] }), _jsxs("div", { className: "order-total", children: [_jsx("strong", { children: "Total Earned:" }), " $", Number(item.total).toFixed(2)] })] }, i))) }))] }));
}
