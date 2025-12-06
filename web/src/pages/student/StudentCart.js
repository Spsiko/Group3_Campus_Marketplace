import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../../style/studentcart.scss";
/*
type CartItem = {
  id: string;               // the Supabase listing UUID
  image?: string;
  title: string;
  price: number;
  seller_id: string;        // optional but useful for seller dashboard
};
*/
export default function StudentCart() {
    const { cart, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    function handleCheckout() {
        navigate("/student/checkout");
    }
    return (_jsxs("section", { className: "student-cart", children: [_jsx("h1", { children: "Your Cart" }), _jsxs("div", { className: "student-cart__layout", children: [_jsxs("div", { className: "student-cart__items", children: [cart.map((item) => (_jsxs("div", { className: "student-cart__item", children: [_jsx("img", { src: item.image ?? "", alt: item.title }), _jsxs("div", { children: [_jsx("h3", { children: item.title }), _jsxs("p", { children: ["$", item.price.toFixed(2)] }), _jsx("button", { onClick: () => removeFromCart(item.id), children: "Remove" })] })] }, item.id))), cart.length === 0 && (_jsx("div", { className: "student-cart__empty", children: "Your cart is empty." }))] }), _jsxs("div", { className: "student-cart__summary", children: [_jsx("h2", { children: "Order Summary" }), _jsxs("p", { children: ["Items: ", cart.length] }), _jsxs("p", { children: ["Subtotal: $", subtotal.toFixed(2)] }), _jsx("button", { type: "button", className: "btn primary student-cart__checkout-btn", onClick: handleCheckout, disabled: cart.length === 0, children: "Proceed to Checkout" }), _jsx("button", { type: "button", className: "btn ghost", onClick: clearCart, children: "Clear Cart" })] })] })] }));
}
