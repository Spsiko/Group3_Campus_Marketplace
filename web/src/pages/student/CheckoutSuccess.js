import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/student/StudentCheckoutSuccess.tsx
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../style/StudentCheckout.scss";
//import { sendNotificationToUser } from "../../lib/notifications";
import { supabase } from "../../lib/supabaseClient";
import { useCart } from "../../context/CartContext";
import { getUser } from "../../lib/auth";
export default function StudentCheckoutSuccess() {
    const { cart } = useCart();
    const navigate = useNavigate();
    const hasRun = useRef(false);
    // ------------------------------------------------------------
    // Map localStorage auth → real user row in `users`
    // ------------------------------------------------------------
    async function getDbUser() {
        const basic = getUser(); // { email, name }
        if (!basic?.email)
            return null;
        const { data, error } = await supabase
            .from("users")
            .select("id, email, full_name")
            .eq("email", basic.email)
            .single();
        if (error) {
            console.error("DB USER LOOKUP FAILED:", error);
            return null;
        }
        return data;
    }
    // ------------------------------------------------------------
    // Finalize order on mount
    // ------------------------------------------------------------
    useEffect(() => {
        async function finalizeOrder() {
            if (hasRun.current)
                return; // prevent double execution
            hasRun.current = true;
            const dbUser = await getDbUser();
            if (!dbUser) {
                navigate("/login");
                return;
            }
            if (!cart || cart.length === 0) {
                console.warn("CheckoutSuccess loaded with empty cart.");
                return;
            }
            // ---------------------------
            // 1. Subtotal
            // ---------------------------
            const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * (item.quantity || 1), 0);
            const orderId = `ORD-${Date.now()}`;
            // ---------------------------
            // 2. Create order
            // ---------------------------
            const { data: order, error: orderErr } = await supabase
                .from("orders")
                .insert({
                order_id: orderId,
                buyer_id: dbUser.id,
                total_amount: subtotal,
                status: "paid",
                payment_method: "stripe",
                items: cart,
            })
                .select()
                .single();
            if (orderErr) {
                console.error("ORDER CREATION FAILED:", orderErr);
                return;
            }
            console.log("ORDER CREATED:", order);
            // 3. Mark listings as sold
            try {
                for (const item of cart) {
                    if (!item.id) {
                        console.warn("Cart item missing listing ID:", item);
                        continue;
                    }
                    console.log("Updating listing:", item.id);
                    const { data, error } = await supabase
                        .from("listings")
                        .update({
                        status: "sold",
                        updated_at: new Date().toISOString(),
                    })
                        .eq("id", item.id);
                    //.select();
                    if (error) {
                        console.error("LISTING UPDATE ERROR:", error);
                    }
                    else {
                        console.log("LISTING UPDATED:", data);
                    }
                }
            }
            catch (err) {
                console.error("LISTING UPDATE FAILED:", err);
            }
            // ---------------------------
            // 4. Notify BUYER
            // ---------------------------
            const buyerNotif = {
                user_id: dbUser.id,
                title: "Order Placed",
                message: `Your order ${order.order_id} has been placed successfully.`,
            };
            console.log("BUYER NOTIF:", buyerNotif);
            await supabase.from("student_notifications").insert(buyerNotif);
            // ---------------------------
            // 5. Notify SELLERS
            // ---------------------------
            const uniqueSellers = new Set(cart.map((i) => i.seller_id));
            for (const sellerId of uniqueSellers) {
                const sellerItems = cart.filter((i) => i.seller_id === sellerId);
                const itemNames = sellerItems.map((i) => i.title).join(", ");
                const sellerNotif = {
                    user_id: sellerId,
                    title: "New Purchase",
                    message: `Your item(s) ${itemNames} were purchased in order ${order.order_id}.`,
                };
                console.log("SELLER NOTIF:", sellerNotif);
                await supabase.from("seller_notifications").insert(sellerNotif);
            }
            // ---------------------------
            // 6. Clear cart
            // ---------------------------
            //clearCart();
        }
        finalizeOrder();
    }, []);
    // ------------------------------------------------------------
    // UI
    // ------------------------------------------------------------
    return (_jsx("div", { className: "checkout-success", children: _jsxs("div", { className: "checkout-success__card", children: [_jsx("div", { className: "checkout-success__icon", children: "\u2713" }), _jsx("h1", { children: "Order Placed Successfully!" }), _jsx("p", { className: "checkout-success__text", children: "Thank you for your purchase. Your items are now pending approval." }), _jsxs("div", { className: "checkout-success__actions", children: [_jsx(Link, { to: "/student/orders", className: "btn primary", children: "View My Orders" }), _jsx(Link, { to: "/student/dashboard", className: "btn ghost", children: "Continue Shopping" })] })] }) }));
}
