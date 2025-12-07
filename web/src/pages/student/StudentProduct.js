import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useCart } from "../../context/CartContext";
import "../../style/StudentProduct.scss";
import { getUser } from "../../lib/auth";
// ADD THIS IMPORT
import StudentReportModal from "../../components/StudentReportModal";
export default function StudentProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [showReport, setShowReport] = useState(false);
    const [listing, setListing] = useState(null);
    const [seller, setSeller] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // fetch seller
    async function fetchSellerByAuthId(authId) {
        const { data, error } = await supabase
            .from("users")
            .select("id, full_name, email, avatar_url, auth_user_id")
            .eq("auth_user_id", authId)
            .single();
        if (error) {
            console.error("Seller fetch error:", error);
            return null;
        }
        return data;
    }
    // load listing + seller
    useEffect(() => {
        if (!id) {
            setError("Missing listing ID.");
            setLoading(false);
            return;
        }
        async function load() {
            setLoading(true);
            setError(null);
            const { data, error: listErr } = await supabase
                .from("listings")
                .select("id, title, description, category, condition, price, status, image_urls, thumbnail_url, seller_id, created_at")
                .eq("id", id)
                .single();
            if (listErr || !data) {
                console.error("Listing fetch error:", listErr);
                setError("Listing not found.");
                setLoading(false);
                return;
            }
            const row = data;
            setListing(row);
            const firstImg = row.thumbnail_url || row.image_urls?.[0] || null;
            setSelectedImage(firstImg);
            if (row.seller_id) {
                const sellerInfo = await fetchSellerByAuthId(row.seller_id);
                setSeller(sellerInfo);
            }
            setLoading(false);
        }
        load();
    }, [id]);
    if (loading)
        return _jsx("div", { className: "student-product__loading", children: "Loading\u2026" });
    if (error)
        return _jsx("div", { className: "student-product__error", children: error });
    if (!listing)
        return (_jsxs("div", { className: "student-product__notfound", children: ["Listing not found.", _jsx("button", { className: "sp-back-btn", onClick: () => navigate(-1), children: "Go Back" })] }));
    const priceNumber = Number(listing.price ?? 0);
    const images = listing.image_urls || [];
    const handleAddToCart = () => {
        addToCart({
            id: listing.id,
            title: listing.title,
            price: priceNumber,
            image: listing.thumbnail_url || images[0] || "",
            seller_id: listing.seller_id || "",
        });
        alert("Item added to cart!");
    };
    return (_jsxs("section", { className: "student-product", children: [_jsxs("div", { className: "sp-container", children: [_jsxs("div", { className: "sp-gallery", children: [selectedImage && (_jsx("img", { src: selectedImage, alt: listing.title, className: "sp-main-img" })), images.length > 0 && (_jsx("div", { className: "sp-thumb-row", children: images.map((img, i) => (_jsx("button", { type: "button", className: `sp-thumb-btn ${selectedImage === img ? "is-active" : ""}`, onClick: () => setSelectedImage(img), children: _jsx("img", { src: img, alt: `Thumbnail ${i + 1}`, className: "sp-thumb-img" }) }, i))) }))] }), _jsxs("div", { className: "sp-details", children: [_jsx("h1", { className: "sp-title", children: listing.title }), _jsxs("div", { className: "sp-price", children: ["$", priceNumber.toFixed(2)] }), _jsxs("div", { className: "sp-badges", children: [listing.category && _jsx("span", { className: "sp-badge", children: listing.category }), listing.condition && (_jsxs("span", { className: "sp-badge", children: ["Condition: ", listing.condition] }))] }), listing.description && _jsx("p", { className: "sp-desc", children: listing.description }), _jsx("div", { className: "sp-meta", children: seller ? (_jsxs(_Fragment, { children: [_jsxs("p", { children: [_jsx("strong", { children: "Seller:" }), " ", seller.full_name || "Unknown"] }), _jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " ", seller.email || "Not provided"] })] })) : (_jsx("p", { className: "sp-warning", children: "Seller information not available." })) }), _jsxs("div", { className: "sp-actions", children: [_jsx("button", { className: "btn primary", onClick: handleAddToCart, children: "Add to Cart" }), _jsx("button", { className: "btn ghost", onClick: () => navigate(`/student/messages/${listing.id}/${listing.seller_id}`), children: "Message Seller" }), _jsx("button", { className: "btn danger", onClick: () => setShowReport(true), children: "Report" })] })] })] }), showReport && (_jsx(StudentReportModal, { listing: {
                    id: listing.id,
                    seller_id: listing.seller_id ?? "", // FIX: cannot be null
                    reportType: "listing" // REQUIRED
                }, onClose: () => setShowReport(false) }))] }));
}
