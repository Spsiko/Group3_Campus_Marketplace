import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* THIS IS A TEMP AI GENERATED FILE */
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useListings } from "../../lib/UseListing";
import { addRecentListing } from "../../lib/RecentViews";
export default function ListingDetailPage() {
    const { id } = useParams();
    const { listings, loading, error } = useListings();
    const listing = listings.find((l) => l.id === id);
    useEffect(() => {
        if (listing) {
            addRecentListing(listing.id);
        }
    }, [listing]);
    if (loading) {
        return _jsx("div", { children: "Loading listing\u2026" });
    }
    if (error) {
        return _jsxs("div", { children: ["Error loading listing: ", error] });
    }
    if (!listing) {
        return _jsx("div", { children: "Listing not found." });
    }
    return (_jsxs("div", { style: { padding: "1.5rem" }, children: [_jsx("h1", { children: "Listing JSON" }), _jsx("pre", { children: JSON.stringify(listing, null, 2) })] }));
}
