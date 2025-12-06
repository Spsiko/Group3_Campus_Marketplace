import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
export default function ListingCard({ listing }) {
    return (_jsxs(Link, { to: `/student/listing/${listing.id}`, className: "listing-card", children: [listing.imageUrl && (_jsx("div", { className: "listing-card__image-wrapper", children: _jsx("img", { src: listing.imageUrl, alt: listing.title, className: "listing-card__image" }) })), _jsxs("div", { className: "listing-card__body", children: [_jsxs("div", { className: "listing-card__header", children: [_jsx("h3", { className: "listing-card__title", children: listing.title }), _jsxs("span", { className: "listing-card__price", children: ["$", listing.price.toFixed(2)] })] }), _jsx("p", { className: "listing-card__category", children: listing.category })] })] }));
}
