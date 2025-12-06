import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../style/studentproduct.scss";
import { Link } from "lucide-react";
export default function StudentProduct() {
    const { id } = useParams();
    const { addToCart } = useCart();
    if (!id)
        return _jsx("div", { className: "student-product__notfound", children: "Product not found." });
    const product = {
        id: Number(id),
        title: "Dell XPS 13 - Used Laptop",
        price: "$480",
        condition: "Used - Excellent",
        category: "Electronics",
        seller: {
            name: "Maya R.",
            email: "maya@campus.com",
        },
        image: "https://placehold.co/600x400?text=Dell+XPS+13",
        description: "This Dell XPS 13 is in excellent condition, used for one semester. Sleek, lightweight, and perfect for student work.",
        postedOn: "Nov 12, 2025",
    };
    const handleAddToCart = () => {
        addToCart(product);
        alert(`${product.title} added to cart!`);
    };
    return (_jsx("section", { className: "student-product", children: _jsxs("div", { className: "sp-container", children: [_jsx("div", { className: "sp-image-wrap", children: _jsx("img", { src: product.image, alt: product.title, className: "sp-image" }) }), _jsxs("div", { className: "sp-details", children: [_jsx("h1", { className: "sp-title", children: product.title }), _jsx("p", { className: "sp-category", children: product.category }), _jsx("p", { className: "sp-condition", children: product.condition }), _jsx("p", { className: "sp-price", children: product.price }), _jsxs("div", { className: "sp-meta", children: [_jsxs("p", { children: [_jsx("strong", { children: "Seller:" }), " ", product.seller.name] }), _jsxs("p", { className: "sp-date", children: ["Posted on ", product.postedOn] })] }), _jsx("p", { className: "sp-desc", children: product.description }), _jsxs("div", { className: "actions", children: [_jsx("button", { className: "btn primary", onClick: handleAddToCart, children: "Add to Cart" }), _jsx(Link, { to: "/student/messages", className: "btn ghost", children: "Message Seller" })] })] })] }) }));
}
