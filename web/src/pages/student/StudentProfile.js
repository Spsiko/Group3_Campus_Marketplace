import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import "../../style/studentprofile.scss";
export default function StudentProfile() {
    const [tab, setTab] = useState("profile");
    // PROFILE STATE
    const [fullName, setFullName] = useState("Student User");
    const [email] = useState("student@campus.com");
    const [bio, setBio] = useState("Loves trading textbooks and tech gear.");
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    // SETTINGS STATE
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [msgAlerts, setMsgAlerts] = useState(true);
    const [publicProfile, setPublicProfile] = useState(true);
    const onAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setAvatarPreview(URL.createObjectURL(file));
    };
    const onSaveProfile = (e) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            alert("Profile updated!");
            setSaving(false);
        }, 1000);
    };
    return (_jsx("section", { className: "student-profile", children: _jsxs("div", { className: "card", children: [_jsxs("div", { className: "tabs", children: [_jsx("button", { className: `tab ${tab === "profile" ? "is-active" : ""}`, onClick: () => setTab("profile"), children: "Profile" }), _jsx("button", { className: `tab ${tab === "settings" ? "is-active" : ""}`, onClick: () => setTab("settings"), children: "Settings" })] }), tab === "profile" && (_jsxs("form", { className: "form", onSubmit: onSaveProfile, children: [_jsx("h1", { children: "My Profile" }), _jsxs("div", { className: "avatar-row", children: [_jsx("img", { className: "avatar", src: avatarPreview || "/Avatar.jpeg", alt: "Avatar" }), _jsxs("label", { className: "upload", children: ["Change Photo", _jsx("input", { type: "file", accept: "image/*", onChange: onAvatarChange })] })] }), _jsxs("div", { className: "grid", children: [_jsxs("div", { className: "field", children: [_jsx("label", { children: "Full Name" }), _jsx("input", { value: fullName, onChange: (e) => setFullName(e.target.value), required: true })] }), _jsxs("div", { className: "field", children: [_jsx("label", { children: "Email" }), _jsx("input", { value: email, disabled: true }), _jsx("small", { className: "muted", children: "Email cannot be changed." })] }), _jsxs("div", { className: "field span-2", children: [_jsx("label", { children: "Bio" }), _jsx("textarea", { placeholder: "Tell others about yourself...", value: bio, onChange: (e) => setBio(e.target.value), rows: 3 })] })] }), _jsxs("div", { className: "actions", children: [_jsx("button", { className: "btn primary", type: "submit", disabled: saving, children: saving ? "Saving..." : "Save Changes" }), _jsx("button", { className: "btn ghost", type: "button", onClick: () => window.history.back(), children: "Cancel" })] })] })), tab === "settings" && (_jsxs("div", { className: "settings", children: [_jsx("h1", { children: "Settings" }), _jsx("p", { className: "muted-sub", children: "Manage notifications, privacy, and account preferences." }), _jsxs("div", { className: "setting-section", children: [_jsx("h3", { children: "Notifications" }), _jsxs("div", { className: "setting-row", children: [_jsx("label", { children: "Email Notifications" }), _jsx("input", { type: "checkbox", checked: emailNotifs, onChange: () => setEmailNotifs(!emailNotifs) })] }), _jsxs("div", { className: "setting-row", children: [_jsx("label", { children: "Message Alerts" }), _jsx("input", { type: "checkbox", checked: msgAlerts, onChange: () => setMsgAlerts(!msgAlerts) })] })] }), _jsxs("div", { className: "setting-section", children: [_jsx("h3", { children: "Privacy" }), _jsxs("div", { className: "setting-row", children: [_jsx("label", { children: "Public Profile" }), _jsx("input", { type: "checkbox", checked: publicProfile, onChange: () => setPublicProfile(!publicProfile) })] })] }), _jsxs("div", { className: "setting-section", children: [_jsx("h3", { children: "Account" }), _jsxs("div", { className: "setting-row", children: [_jsx("label", { children: "Change Password" }), _jsx("button", { className: "btn ghost small", children: "Send Reset Link" })] }), _jsxs("div", { className: "setting-row danger", children: [_jsx("label", { children: "Delete Account" }), _jsx("button", { className: "btn danger small", children: "Delete" })] })] })] }))] }) }));
}
