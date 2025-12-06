import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/student/StudentCheckoutSuccess.tsx
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../style/StudentCheckout.scss";
import { supabase } from "../../lib/supabaseClient";
import { useCart } from "../../context/CartContext";
import { getUser } from "../../lib/auth";
import { sendNotificationToUser } from "../../lib/notifications";
export default function StudentCheckoutSuccess() {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const hasRun = useRef(false);
    // ------------------------------------------------------------
    // Fetch DB user from users table
    // ------------------------------------------------------------
    async function getDbUser() {
        const authUser = getUser();
        console.log("LOCALSTORAGE USER:", authUser);
        if (!authUser?.email)
            return null;
        const { data, error } = await supabase
            .from("users")
            .select("id, email, full_name")
            .eq("email", authUser.email)
            .single();
        console.log("DB LOOKUP RESULT:", data, "ERROR:", error);
        return data || null;
    }
    // ------------------------------------------------------------
    // Finalize order after Stripe success
    // ------------------------------------------------------------
    useEffect(() => {
        async function finalizeOrder() {
            if (hasRun.current)
                return;
            hasRun.current = true;
            console.log("CHECKOUT SUCCESS PAGE LOADED");
            // 1. Load DB user
            const dbUser = await getDbUser();
            if (!dbUser) {
                console.error("No DB user found — redirecting to login");
                navigate("/login");
                return;
            }
            console.log("DB USER FOUND:", dbUser);
            if (!cart || cart.length === 0) {
                console.warn("Cart empty during CheckoutSuccess.");
                return;
            }
            console.log("CART CONTENTS:", cart);
            // 2. Subtotal
            const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * (item.quantity || 1), 0);
            const orderId = `ORD-${Date.now()}`;
            console.log("ORDER SUBTOTAL:", subtotal, "ORDER ID:", orderId);
            // --------------------------------------------------------
            // 3. Create order in `orders` table
            // --------------------------------------------------------
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
            // --------------------------------------------------------
            // 4. Insert rows into order_item table
            // --------------------------------------------------------
            const orderItemsPayload = cart.map((item) => ({
                order_id: orderId,
                listing_id: item.id,
                seller_id: item.seller_id,
                quantity: item.quantity || 1,
                price: Number(item.price),
                total_amount: Number(item.price) * (item.quantity || 1),
            }));
            console.log("ORDER_ITEM PAYLOAD:", orderItemsPayload);
            const { error: oiErr } = await supabase
                .from("order_item")
                .insert(orderItemsPayload);
            if (oiErr) {
                console.error("ORDER_ITEM INSERT FAILED:", oiErr);
            }
            else {
                console.log("ORDER_ITEM INSERTED SUCCESSFULLY");
            }
            // --------------------------------------------------------
            // 5. Update listing statuses
            // --------------------------------------------------------
            console.log("UPDATING LISTINGS...");
            for (const item of cart) {
                if (!item.id)
                    continue;
                console.log("UPDATING LISTING:", item.id);
                const { error } = await supabase
                    .from("listings")
                    .update({
                    status: "sold",
                    updated_at: new Date().toISOString(),
                })
                    .eq("id", item.id);
                if (error)
                    console.error("LISTING UPDATE FAILED", error);
                else
                    console.log("LISTING UPDATED SUCCESSFULLY:", item.id);
            }
            // --------------------------------------------------------
            // 6. BUYER notification
            // --------------------------------------------------------
            console.log("SENDING BUYER NOTIFICATION →", dbUser.id);
            await sendNotificationToUser(dbUser.id, `Your order ${orderId} has been placed successfully.`, dbUser.id);
            // --------------------------------------------------------
            // 7. SELLER notifications using order_item table
            // --------------------------------------------------------
            console.log("FETCHING ORDERED ITEMS FROM order_item...");
            const { data: orderedItems, error: oiFetchError } = await supabase
                .from("order_item")
                .select("seller_id, listing_id")
                .eq("order_id", orderId);
            if (oiFetchError) {
                console.error("Error fetching ordered items:", oiFetchError);
            }
            else {
                console.log("ORDERED ITEMS:", orderedItems);
            }
            if (orderedItems && orderedItems.length > 0) {
                const sellerGroups = {};
                for (const row of orderedItems) {
                    if (!sellerGroups[row.seller_id]) {
                        sellerGroups[row.seller_id] = [];
                    }
                    sellerGroups[row.seller_id].push(row.listing_id);
                }
                console.log("SELLER GROUPS:", sellerGroups);
                // Send grouped notifications
                for (const sellerId of Object.keys(sellerGroups)) {
                    const listingIds = sellerGroups[sellerId].join(", ");
                    console.log(`Sending seller notification to ${sellerId} for listings: ${listingIds}`);
                    await sendNotificationToUser(sellerId, `Your listings (${listingIds}) were purchased in order ${orderId}.`);
                    // Fetch seller's real name
                    /*
                    const { data: seller } = await supabase
                    .from("users")
                    .select("full_name")
                    .eq("id", sellerId)
                    .maybeSingle();
          
                    await sendNotificationToUser(
                    sellerId,
                    `Your listings (${listingIds}) were purchased in order ${orderId}.`,
                    seller?.full_name     // send seller's real name
                    );
                    */
                }
            }
            // --------------------------------------------------------
            // 8. Clear cart
            // --------------------------------------------------------
            console.log("CLEARING CART...");
            clearCart();
        }
        finalizeOrder();
    }, []);
    // ------------------------------------------------------------
    // UI
    // ------------------------------------------------------------
    return (_jsx("div", { className: "checkout-success", children: _jsxs("div", { className: "checkout-success__card", children: [_jsx("div", { className: "checkout-success__icon", children: "\u2713" }), _jsx("h1", { children: "Order Placed Successfully!" }), _jsx("p", { className: "checkout-success__text", children: "Thank you for your purchase. Your items are now pending approval." }), _jsxs("div", { className: "checkout-success__actions", children: [_jsx(Link, { to: "/student/orders", className: "btn primary", children: "View My Orders" }), _jsx(Link, { to: "/student/dashboard", className: "btn ghost", children: "Continue Shopping" })] })] }) }));
}
