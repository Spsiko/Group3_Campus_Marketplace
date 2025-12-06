import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUser } from "../../lib/resolvedUser";
import "../../style/MyListings.scss";
export default function MyListings() {
    const [authUser, setAuthUser] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadUser() {
            const u = await getResolvedUser();
            setAuthUser(u || null);
        }
        loadUser();
    }, []);
    useEffect(() => {
        if (!authUser?.auth_user_id)
            return;
        async function loadListings() {
            setLoading(true);
            const { data, error } = await supabase
                .from("listings")
                .select("id, title, price, status, image_urls, created_at")
                .eq("seller_id", authUser.auth_user_id)
                .order("created_at", { ascending: false });
            if (!error && data)
                setListings(data);
            setLoading(false);
        }
        loadListings();
    }, [authUser]);
    if (!authUser)
        return _jsx("p", { children: "Loading..." });
    return (_jsxs("div", { className: "my-listings-page", children: [_jsx("h2", { children: "My Listings" }), loading ? (_jsx("p", { children: "Loading listings..." })) : listings.length === 0 ? (_jsx("p", { children: "No listings found." })) : (_jsx("div", { className: "listings-grid", children: listings.map((l) => (_jsxs("div", { className: "listing-card", children: [_jsx("img", { src: l.image_urls?.[0] || "/placeholder.jpg", alt: l.title }), _jsx("h3", { children: l.title }), _jsxs("p", { className: "status", children: ["Status: ", _jsx("strong", { children: l.status })] }), _jsxs("p", { className: "price", children: ["$", l.price] }), _jsx("button", { className: `btn ${l.status === "sold" ? "disabled" : "primary"}`, disabled: l.status === "sold", onClick: () => window.location.assign(`/student/editlistings/${l.id}`), children: l.status === "sold" ? "Not Editable" : "Edit" })] }, l.id))) }))] }));
}
