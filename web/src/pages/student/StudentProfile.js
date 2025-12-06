import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/student/StudentProfile.tsx
import { useEffect, useState } from "react";
import "../../style/studentprofile.scss";
import "../../style/SellerOrders.scss";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUser } from "../../lib/resolvedUser";
import { signOut } from "../../lib/auth";
export default function StudentProfile() {
    const [authUser, setAuthUser] = useState(null);
    const [tab, setTab] = useState("profile");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [myListings, setMyListings] = useState([]);
    const [soldListings, setSoldListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const [loadingSold, setLoadingSold] = useState(true);
    const [newPassword, setNewPassword] = useState("");
    const [pwMessage, setPwMessage] = useState("");
    // ----------------------------------------------------------
    // Load resolved user
    // ----------------------------------------------------------
    useEffect(() => {
        async function loadUser() {
            const u = await getResolvedUser();
            setAuthUser(u || null);
        }
        loadUser();
    }, []);
    // ----------------------------------------------------------
    // Load Profile + Listings + Sold Listings
    // ----------------------------------------------------------
    useEffect(() => {
        if (!authUser || !authUser.auth_user_id)
            return;
        // Profile load
        async function loadProfile() {
            const { data } = await supabase
                .from("users")
                .select("*")
                .eq("auth_user_id", authUser.auth_user_id)
                .single();
            if (data) {
                setFullName(data.full_name || "");
                setEmail(data.email || "");
                setAvatarPreview(data.avatar_url || null);
            }
        }
        // Load listings
        async function loadListings() {
            setLoadingListings(true);
            const { data } = await supabase
                .from("listings")
                .select("id, title, price, created_at, image_urls, status")
                .eq("seller_id", authUser.auth_user_id)
                .order("created_at", { ascending: false });
            if (data)
                setMyListings(data);
            setLoadingListings(false);
        }
        // Load sold listings
        async function loadSoldListings() {
            setLoadingSold(true);
            const { data } = await supabase
                .from("listings")
                .select("id, title, price, status, created_at, updated_at")
                .eq("seller_id", authUser.auth_user_id)
                .eq("status", "sold")
                .order("updated_at", { ascending: false });
            if (data)
                setSoldListings(data);
            setLoadingSold(false);
        }
        loadProfile();
        loadListings();
        loadSoldListings();
    }, [authUser]);
    // ----------------------------------------------------------
    // Save profile changes
    // ----------------------------------------------------------
    const onSaveProfile = async (e) => {
        e.preventDefault();
        if (!authUser)
            return;
        setSaving(true);
        const { error } = await supabase
            .from("users")
            .update({
            full_name: fullName,
            avatar_url: avatarPreview,
        })
            .eq("auth_user_id", authUser.auth_user_id)
            .select()
            .single();
        setSaving(false);
        if (error)
            alert("Failed to update profile");
        else
            alert("Profile updated");
    };
    // ----------------------------------------------------------
    // Change Password
    // ----------------------------------------------------------
    const onChangePassword = async (e) => {
        e.preventDefault();
        if (!authUser)
            return;
        if (newPassword.length < 6) {
            setPwMessage("Password must be at least 6 characters");
            return;
        }
        const { error } = await supabase
            .from("users")
            .update({ password: newPassword })
            .eq("auth_user_id", authUser.auth_user_id);
        if (error) {
            setPwMessage("Password update failed");
            return;
        }
        // update local storage
        localStorage.setItem("cm_user", JSON.stringify({ ...authUser, password: newPassword }));
        setPwMessage("Password updated successfully");
        setNewPassword("");
    };
    // ----------------------------------------------------------
    // Deactivate Account (RLS-safe)
    // ----------------------------------------------------------
    const onDeactivate = async () => {
        if (!authUser)
            return;
        const yes = confirm("Are you sure you want to deactivate your account?");
        if (!yes)
            return;
        // Mark user inactive
        const { error } = await supabase
            .from("users")
            .update({
            is_active: false,
            status: "inactive",
            deleted_at: new Date().toISOString(),
        })
            .eq("auth_user_id", authUser.auth_user_id);
        if (error) {
            alert("Account deactivation failed.");
            return;
        }
        // Log out locally + Supabase session
        signOut();
        supabase.auth.signOut();
        window.location.href = "/login";
    };
    // ----------------------------------------------------------
    // Render
    // ----------------------------------------------------------
    if (!authUser)
        return _jsx("p", { style: { padding: 20 }, children: "Loading profile..." });
    return (_jsx("section", { className: "student-profile", children: _jsxs("div", { className: "card", children: [_jsxs("div", { className: "tabs-row", children: [_jsxs("div", { className: "tabs", children: [_jsx("button", { className: `tab ${tab === "profile" ? "is-active" : ""}`, onClick: () => setTab("profile"), children: "Profile" }), _jsx("button", { className: `tab ${tab === "listings" ? "is-active" : ""}`, onClick: () => setTab("listings"), children: "Listings" }), _jsx("button", { className: `tab ${tab === "sold" ? "is-active" : ""}`, onClick: () => setTab("sold"), children: "Sold Listings" }), _jsx("button", { className: `tab ${tab === "settings" ? "is-active" : ""}`, onClick: () => setTab("settings"), children: "Settings" })] }), _jsx("button", { className: "logout-btn", onClick: () => {
                                signOut();
                                supabase.auth.signOut();
                                window.location.href = "/login";
                            }, children: "Logout" })] }), tab === "profile" && (_jsxs("form", { className: "form", onSubmit: onSaveProfile, children: [_jsx("h1", { children: "My Profile" }), _jsxs("div", { className: "avatar-row", children: [_jsx("img", { className: "avatar", src: avatarPreview || "/Avatar.jpeg", alt: "Avatar" }), _jsxs("label", { className: "upload", children: ["Change Photo", _jsx("input", { type: "file", accept: "image/*", onChange: (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file)
                                                    return;
                                                const reader = new FileReader();
                                                reader.onload = () => setAvatarPreview(reader.result);
                                                reader.readAsDataURL(file);
                                            } })] })] }), _jsxs("div", { className: "grid", children: [_jsxs("div", { className: "field", children: [_jsx("label", { children: "Full Name" }), _jsx("input", { value: fullName, onChange: (e) => setFullName(e.target.value) })] }), _jsxs("div", { className: "field", children: [_jsx("label", { children: "Email" }), _jsx("input", { value: email, disabled: true })] })] }), _jsx("div", { className: "actions", children: _jsx("button", { className: "btn primary", type: "submit", disabled: saving, children: saving ? "Saving..." : "Save Changes" }) })] })), tab === "listings" && (_jsxs("div", { className: "listings-section", children: [_jsx("h2", { children: "My Listings" }), loadingListings ? (_jsx("p", { children: "Loading listings..." })) : myListings.length === 0 ? (_jsx("p", { children: "No listings yet." })) : (_jsx("div", { className: "listings-grid", children: myListings.map((l) => (_jsxs("div", { className: "listing-card", children: [_jsx("img", { src: l.image_urls?.[0] || "/placeholder.jpg", alt: l.title }), _jsx("h4", { children: l.title }), _jsxs("p", { children: ["$", Number(l.price).toFixed(2)] }), _jsxs("p", { children: ["Status: ", l.status] }), _jsx("button", { className: `tab ${tab === "listings" ? "is-active" : ""}`, onClick: () => (window.location.href = "/student/mylistings"), children: "Edit" })] }, l.id))) }))] })), tab === "sold" && (_jsxs("div", { className: "seller-orders-page", children: [_jsx("h2", { children: "Sold Listings" }), loadingSold ? (_jsx("p", { children: "Loading sold items..." })) : soldListings.length === 0 ? (_jsx("p", { children: "No sold items yet." })) : (_jsx("div", { className: "orders-list", children: soldListings.map((item) => (_jsxs("div", { className: "order-card", children: [_jsxs("div", { className: "order-header", children: [_jsx("h3", { children: item.title }), _jsx("span", { className: "status-badge status-sold", children: item.status })] }), _jsxs("div", { className: "order-meta", children: [_jsxs("p", { children: [_jsx("strong", { children: "Price:" }), " $", Number(item.price).toFixed(2)] }), _jsxs("p", { children: [_jsx("strong", { children: "Listed On:" }), " ", new Date(item.created_at).toLocaleString()] }), _jsxs("p", { children: [_jsx("strong", { children: "Sold On:" }), " ", new Date(item.updated_at).toLocaleString()] })] })] }, item.id))) }))] })), tab === "settings" && (_jsxs("div", { className: "settings", children: [_jsx("h1", { children: "Settings" }), _jsxs("div", { className: "setting-section", children: [_jsx("h3", { children: "Change Password" }), _jsxs("form", { onSubmit: onChangePassword, children: [_jsx("input", { type: "password", placeholder: "New password", value: newPassword, onChange: (e) => setNewPassword(e.target.value) }), _jsx("button", { className: "btn primary small", children: "Update Password" })] }), pwMessage && _jsx("p", { children: pwMessage })] }), _jsxs("div", { className: "setting-section danger", children: [_jsx("h3", { children: "Deactivate Account" }), _jsx("button", { className: "btn danger", onClick: onDeactivate, children: "Deactivate My Account" })] })] }))] }) }));
}
