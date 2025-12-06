import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCart } from "../../context/CartContext";
import "../../style/StudentCheckout.scss";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../lib/auth";
export default function Checkout() {
    const { cart } = useCart();
    const navigate = useNavigate();
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    async function handlePlaceOrder() {
        const user = getUser();
        if (!user || !user.id) {
            alert("Please login before checking out.");
            navigate("/login");
            return;
        }
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        try {
            // ------------------------------------------------------
            // 1. PREPARE ITEMS FOR EDGE FUNCTION (correct format)
            // ------------------------------------------------------
            const items = cart.map((item) => ({
                title: item.title,
                price: Number(item.price),
                quantity: Number(item.quantity || 1),
            }));
            console.log("Sending payload to Stripe function:", items);
            // ------------------------------------------------------
            // 2. CALL SUPABASE EDGE FUNCTION
            // ------------------------------------------------------
            const { data, error } = await supabase.functions.invoke("create-checkout-session", {
                body: { items },
            });
            if (error) {
                console.error("Stripe session error:", error);
                alert("Payment initialization failed.");
                return;
            }
            if (!data?.url) {
                console.error("Stripe did not return URL:", data);
                alert("Stripe did not return a redirect URL.");
                return;
            }
            // ------------------------------------------------------
            // 3. REDIRECT TO STRIPE CHECKOUT
            // ------------------------------------------------------
            window.location.href = data.url;
        }
        catch (err) {
            console.error("Checkout error:", err);
            alert("Unexpected error during checkout.");
        }
    }
    return (_jsxs("div", { className: "checkout-page", children: [_jsx("h1", { children: "Checkout" }), _jsx("div", { className: "checkout-items", children: cart.map((item) => (_jsxs("div", { className: "checkout-item", children: [_jsx("img", { src: item.image, alt: item.title }), _jsxs("div", { children: [_jsx("div", { className: "title", children: item.title }), _jsxs("div", { className: "price", children: ["$", item.price, " \u00D7 ", item.quantity] })] })] }, item.id))) }), _jsxs("div", { className: "checkout-summary", children: [_jsx("h2", { children: "Order Summary" }), _jsxs("div", { className: "summary-row", children: [_jsx("span", { children: "Subtotal" }), _jsxs("span", { children: ["$", subtotal.toFixed(2)] })] })] }), _jsx("button", { className: "btn primary checkout-confirm-btn", onClick: handlePlaceOrder, children: "Proceed to Payment" })] }));
}
