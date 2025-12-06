import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import "../../style/adminprofile.scss";
// import { supabase } from "../../lib/supabaseClient";
export default function AdminProfile() {
    const [fullName, setFullName] = useState("Admin User");
    const [email] = useState("admin@campus.com");
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const onAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setAvatarPreview(URL.createObjectURL(file));
        // TODO: upload to storage + persist URL
    };
    const onSendReset = async () => {
        alert("Reset link sent (wire with supabase.auth.resetPasswordForEmail).");
    };
    const onSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // TODO: update users set full_name=?, avatar_url=? where id=?
            alert("Profile updated!");
        }
        catch (err) {
            console.error(err);
            alert("Failed to update profile");
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsx("section", { className: "admin-profile", children: _jsxs("div", { className: "card", children: [_jsx("h1", { children: "Admin Profile" }), _jsxs("form", { className: "form", onSubmit: onSave, children: [_jsxs("div", { className: "avatar-row", children: [_jsx("img", { className: "avatar", src: avatarPreview || "/avatar-placeholder.png", alt: "Avatar" }), _jsxs("label", { className: "upload", children: ["Change Photo", _jsx("input", { type: "file", accept: "image/*", onChange: onAvatarChange })] })] }), _jsxs("div", { className: "grid", children: [_jsxs("div", { className: "field", children: [_jsx("label", { children: "Full Name" }), _jsx("input", { value: fullName, onChange: (e) => setFullName(e.target.value), required: true })] }), _jsxs("div", { className: "field", children: [_jsx("label", { children: "Email" }), _jsx("input", { value: email, disabled: true }), _jsx("small", { className: "muted", children: "Email cannot be changed." })] }), _jsxs("div", { className: "field", children: [_jsx("label", { children: "Password" }), _jsx("button", { type: "button", className: "linklike", onClick: onSendReset, children: "Send password reset link" })] })] }), _jsxs("div", { className: "actions", children: [_jsx("button", { className: "btn primary", type: "submit", disabled: saving, children: saving ? "Saving..." : "Save" }), _jsx("button", { className: "btn ghost", type: "button", onClick: () => window.history.back(), children: "Cancel" })] })] })] }) }));
}
