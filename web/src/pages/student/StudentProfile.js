import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import "../../style/StudentProfile.scss";
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
    const [newPassword, setNewPassword] = useState("");
    const [pwMessage, setPwMessage] = useState("");
    // ------------------------------------------
    // Load correct user via resolvedUser
    // ------------------------------------------
    useEffect(() => {
        async function loadUser() {
            const user = await getResolvedUser();
            setAuthUser(user || null);
        }
        loadUser();
    }, []);
    // ------------------------------------------
    // Load profile and listings
    // ------------------------------------------
    useEffect(() => {
        if (!authUser || !authUser.auth_user_id)
            return;
        const loadProfile = async () => {
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
        };
        const loadListings = async () => {
            const { data } = await supabase
                .from("listings")
                .select("id, title, price, created_at, image_urls")
                .eq("seller_id", authUser.auth_user_id)
                .order("created_at", { ascending: false });
            if (data)
                setMyListings(data);
        };
        loadProfile();
        loadListings();
    }, [authUser]);
    // ------------------------------------------
    // Upload avatar
    // ------------------------------------------
    const onAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !authUser)
            return;
        const filePath = `${authUser.auth_user_id}-${Date.now()}.jpg`;
        const { error: uploadErr } = await supabase.storage
            .from("product-images")
            .upload(filePath, file);
        if (uploadErr) {
            alert("Failed to upload image");
            return;
        }
        const { data: publicUrl } = supabase.storage
            .from("product-images")
            .getPublicUrl(filePath);
        if (publicUrl?.publicUrl) {
            setAvatarPreview(publicUrl.publicUrl);
        }
    };
    // ------------------------------------------
    // Save profile changes (RLS compatible)
    // ------------------------------------------
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
        if (error) {
            alert("Failed to update profile");
        }
        else {
            alert("Profile updated");
        }
    };
    // ------------------------------------------
    // Change Password (DB + localStorage)
    // ------------------------------------------
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
            .eq("auth_user_id", authUser.auth_user_id)
            .select()
            .single();
        if (error) {
            setPwMessage("Password update failed");
            return;
        }
        // update local session
        localStorage.setItem("cm_user", JSON.stringify({ ...authUser, password: newPassword }));
        setPwMessage("Password updated successfully");
        setNewPassword("");
    };
    // ------------------------------------------
    // Deactivate account (RLS safe)
    // ------------------------------------------
    const onDeactivate = async () => {
        if (!authUser)
            return;
        const yes = confirm("Are you sure?");
        if (!yes)
            return;
        await supabase
            .from("users")
            .update({
            is_active: false,
            status: "inactive",
            deleted_at: new Date().toISOString(),
        })
            .eq("auth_user_id", authUser.auth_user_id)
            .select()
            .single();
        signOut();
        window.location.href = "/";
    };
    // ------------------------------------------
    // Render
    // ------------------------------------------
    if (!authUser)
        return _jsx("p", { style: { padding: 20 }, children: "Loading profile..." });
    return (_jsx("section", { className: "student-profile", children: _jsxs("div", { className: "card", children: [_jsxs("div", { className: "tabs-row", children: [_jsxs("div", { className: "tabs", children: [_jsx("button", { className: `tab ${tab === "profile" ? "is-active" : ""}`, onClick: () => setTab("profile"), children: "Profile" }), _jsx("button", { className: `tab ${tab === "settings" ? "is-active" : ""}`, onClick: () => setTab("settings"), children: "Settings" })] }), _jsx("button", { className: "logout-btn", onClick: () => {
                                signOut();
                                supabase.auth.signOut();
                                window.location.href = "/login";
                            }, children: "Logout" })] }), tab === "profile" && (_jsxs("form", { className: "form", onSubmit: onSaveProfile, children: [_jsx("h1", { children: "My Profile" }), _jsxs("div", { className: "avatar-row", children: [_jsx("img", { className: "avatar", src: avatarPreview || "/Avatar.jpeg", alt: "Avatar" }), _jsxs("label", { className: "upload", children: ["Change Photo", _jsx("input", { type: "file", accept: "image/*", onChange: onAvatarChange })] })] }), _jsxs("div", { className: "grid", children: [_jsxs("div", { className: "field", children: [_jsx("label", { children: "Full Name" }), _jsx("input", { value: fullName, onChange: (e) => setFullName(e.target.value) })] }), _jsxs("div", { className: "field", children: [_jsx("label", { children: "Email" }), _jsx("input", { value: email, disabled: true })] })] }), _jsx("div", { className: "actions", children: _jsx("button", { className: "btn primary", type: "submit", disabled: saving, children: saving ? "Saving..." : "Save Changes" }) }), _jsx("h2", { style: { marginTop: 30 }, children: "My Listings" }), _jsxs("div", { className: "listings-grid", children: [myListings.map((l) => (_jsxs("div", { className: "listing-card", children: [_jsx("img", { src: l.image_urls?.[0] || "/placeholder.jpg", alt: l.title }), _jsx("h4", { children: l.title }), _jsxs("p", { children: ["$", l.price] })] }, l.id))), myListings.length === 0 && _jsx("p", { children: "No listings yet." })] })] })), tab === "settings" && (_jsxs("div", { className: "settings", children: [_jsx("h1", { children: "Settings" }), _jsxs("div", { className: "setting-section", children: [_jsx("h3", { children: "Change Password" }), _jsxs("form", { onSubmit: onChangePassword, children: [_jsx("input", { type: "password", placeholder: "New password", value: newPassword, onChange: (e) => setNewPassword(e.target.value) }), _jsx("button", { className: "btn primary small", children: "Update Password" }), pwMessage && _jsx("p", { children: pwMessage })] })] }), _jsxs("div", { className: "setting-section danger", children: [_jsx("h3", { children: "Deactivate Account" }), _jsx("button", { className: "btn danger", onClick: onDeactivate, children: "Deactivate My Account" })] })] }))] }) }));
}
