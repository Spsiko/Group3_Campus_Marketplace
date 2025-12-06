import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useCart } from "../../context/CartContext";
import "../../style/studentcart.scss";
export default function StudentCart() {
    const { cart, removeFromCart, clearCart } = useCart();
    const totalPrice = cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.]/g, ""));
        return sum + (isNaN(price) ? 0 : price);
    }, 0);
    return (_jsx("section", { className: "student-cart", children: _jsxs("div", { className: "sc-container", children: [_jsxs("h1", { className: "sc-title", children: ["Your Cart (", cart.length, " items)"] }), cart.length === 0 ? (_jsxs("div", { className: "sc-empty", children: [_jsx("p", { children: "No items yet." }), _jsx("a", { href: "/student/listings", className: "sc-btn sc-btn--gold", children: "Browse Listings" })] })) : (_jsxs(_Fragment, { children: [_jsx("ul", { className: "sc-list", children: cart.map((item) => (_jsxs("li", { className: "sc-item", children: [_jsxs("div", { className: "sc-info", children: [_jsx("img", { src: item.image, alt: item.title, className: "sc-img" }), _jsxs("div", { className: "sc-details", children: [_jsx("p", { className: "sc-name", children: item.title }), _jsx("p", { className: "sc-price", children: item.price })] })] }), _jsx("button", { className: "sc-remove", onClick: () => removeFromCart(item.id), children: "Remove" })] }, item.id))) }), _jsxs("div", { className: "sc-footer", children: [_jsxs("p", { className: "sc-total", children: ["Total: ", _jsxs("span", { children: ["$", totalPrice.toFixed(2)] })] }), _jsxs("div", { className: "sc-actions", children: [_jsx("button", { className: "sc-btn sc-btn--gold", onClick: clearCart, children: "Clear Cart" }), _jsx("button", { className: "sc-btn sc-btn--checkout", children: "Checkout" })] })] })] }))] }) }));
}
