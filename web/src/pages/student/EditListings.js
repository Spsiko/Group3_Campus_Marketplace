import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/student/EditListing.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import "../../style/EditListings.scss";
export default function EditListing() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [newPrice, setNewPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        async function fetchListing() {
            setLoading(true);
            const { data, error } = await supabase
                .from("listings")
                .select("id, title, price, status, image_urls")
                .eq("id", id)
                .single();
            if (error || !data) {
                alert("Listing not found");
                navigate("/my-listings");
                return;
            }
            setListing(data);
            setNewPrice(data.price);
            setLoading(false);
        }
        fetchListing();
    }, [id]);
    // ------------------------------------------------------------
    // SAVE UPDATED PRICE
    // ------------------------------------------------------------
    async function onSave() {
        if (!newPrice || newPrice <= 0) {
            alert("Invalid price entered.");
            return;
        }
        setSaving(true);
        const { error } = await supabase
            .from("listings")
            .update({ price: newPrice })
            .eq("id", id);
        setSaving(false);
        if (error) {
            alert("Unable to update listing.");
            return;
        }
        alert("Listing updated successfully!");
        navigate("/my-listings");
    }
    // ------------------------------------------------------------
    // DELETE LISTING
    // ------------------------------------------------------------
    async function onDelete() {
        // sold listings cannot be deleted
        if (listing.status === "sold") {
            alert("Sold listings cannot be deleted.");
            return;
        }
        const yes = confirm(`Are you sure you want to delete "${listing.title}"? This cannot be undone.`);
        if (!yes)
            return;
        setSaving(true);
        const { error } = await supabase
            .from("listings")
            .delete()
            .eq("id", id);
        setSaving(false);
        if (error) {
            alert("Failed to delete listing.");
            return;
        }
        alert("Listing deleted.");
        navigate("/my-listings");
    }
    if (loading || !listing)
        return _jsx("p", { style: { padding: 20 }, children: "Loading listing..." });
    // ------------------------------------------------------------
    // UI
    // ------------------------------------------------------------
    return (_jsx("div", { className: "edit-listing-page", children: _jsxs("div", { className: "card", children: [_jsx("h2", { children: "Edit Listing" }), _jsx("img", { src: listing.image_urls?.[0] || "/placeholder.jpg", alt: listing.title, className: "preview" }), _jsx("h3", { children: listing.title }), _jsxs("p", { children: [_jsx("strong", { children: "Status:" }), " ", listing.status] }), listing.status === "sold" ? (_jsx("p", { className: "note", children: "This listing has already been sold and cannot be edited or deleted." })) : (_jsxs(_Fragment, { children: [_jsx("label", { children: "Price" }), _jsx("input", { type: "number", value: newPrice, onChange: (e) => setNewPrice(Number(e.target.value)) }), _jsxs("div", { className: "actions", children: [_jsx("button", { className: "btn primary", onClick: onSave, disabled: saving, children: saving ? "Saving..." : "Save" }), _jsx("button", { className: "btn ghost", onClick: () => navigate("/my-listings"), disabled: saving, children: "Cancel" })] }), _jsx("button", { className: "btn danger delete-btn", onClick: onDelete, disabled: saving, children: "Delete Listing" })] }))] }) }));
}
