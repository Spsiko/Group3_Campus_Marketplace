import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "../style/studentheader.scss";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingCart, User } from "lucide-react"; // lightweight icons
export default function StudentHeader({ open, setOpen }) {
    const { cart } = useCart();
    return (_jsxs("header", { className: "student-header", children: [_jsx("button", { className: "brand", type: "button", onClick: () => setOpen(!open), "aria-label": "Toggle admin sidebar", children: "Campus Marketplace" }), _jsx("div", {}), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "24px" }, children: [_jsxs(Link, { to: "/student/cart", style: { position: "relative", display: "inline-flex", alignItems: "center" }, children: [_jsx(ShoppingCart, { size: 22, color: "#111827" }), cart.length > 0 && (_jsx("span", { style: {
                                    position: "absolute",
                                    top: "-6px",
                                    right: "-10px",
                                    background: "#d4b483",
                                    color: "#111",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    borderRadius: "999px",
                                    padding: "2px 6px",
                                    lineHeight: 1,
                                }, children: cart.length }))] }), _jsx(Link, { to: "/student/profile", style: {
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "32px",
                            height: "32px",
                            borderRadius: "999px",
                            background: "#f3f4f6",
                            color: "#111827",
                            textDecoration: "none",
                            transition: "background 0.2s ease",
                        }, onMouseEnter: (e) => ((e.currentTarget.style.background = "#e5e7eb")), onMouseLeave: (e) => ((e.currentTarget.style.background = "#f3f4f6")), children: _jsx(User, { size: 18 }) })] })] }));
}
