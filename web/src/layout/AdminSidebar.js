import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../style/adminsidebar.scss";
import { supabase } from "../lib/supabaseClient";
function getStoredUser() {
    try {
        const raw = localStorage.getItem("cm_user");
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
export default function AdminSidebar({ open, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [name, setName] = useState("Admin");
    const [email, setEmail] = useState("");
    const loadProfile = useCallback(async () => {
        const s = getStoredUser();
        if (s?.full_name)
            setName(s.full_name);
        if (s?.email)
            setEmail(s.email);
        try {
            if (s?.id) {
                const { data } = await supabase
                    .from("users")
                    .select("full_name,email")
                    .eq("id", s.id)
                    .single();
                if (data) {
                    setName(data.full_name || s.full_name || "Admin");
                    setEmail(data.email || s.email || "");
                    return;
                }
            }
            if (s?.email) {
                const { data } = await supabase
                    .from("users")
                    .select("full_name,email")
                    .eq("email", s.email)
                    .single();
                if (data) {
                    setName(data.full_name || "Admin");
                    setEmail(data.email || s.email || "");
                }
            }
        }
        catch { }
    }, []);
    useEffect(() => {
        loadProfile();
        const onStorage = (e) => e.key === "cm_user" && loadProfile();
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [loadProfile]);
    // CLOSE THE SIDEBAR ON ANY ROUTE CHANGE
    useEffect(() => {
        if (open && onClose)
            onClose();
    }, [location.pathname]);
    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        }
        catch { }
        localStorage.removeItem("cm_user");
        navigate("/login", { replace: true });
    };
    // CLOSE ON NAV CLICK
    const closeOnClick = () => onClose?.();
    return (_jsxs(_Fragment, { children: [open && _jsx("div", { className: "portal-overlay", onClick: onClose }), _jsxs("aside", { className: `portal ${open ? "open" : ""}`, "aria-label": "Admin sidebar", children: [_jsxs("div", { children: [_jsx("div", { className: "portal-head", children: "Admin Portal" }), _jsxs("nav", { className: "portal-nav", children: [_jsxs(NavLink, { to: "/admin/dashboard", onClick: closeOnClick, className: "navitem", children: [_jsx("span", { className: "icon", children: "\uD83D\uDCCA" }), "Dashboard"] }), _jsxs(NavLink, { to: "/admin/manage-users", onClick: closeOnClick, className: "navitem", children: [_jsx("span", { className: "icon", children: "\uD83D\uDC64" }), "Users"] }), _jsxs(NavLink, { to: "/admin/manage-listings", onClick: closeOnClick, className: "navitem", children: [_jsx("span", { className: "icon", children: "\uD83D\uDCE6" }), "Listings"] }), _jsxs(NavLink, { to: "/admin/manage-orders", onClick: closeOnClick, className: "navitem", children: [_jsx("span", { className: "icon", children: "\uD83D\uDECD\uFE0F" }), "Orders"] }), _jsxs(NavLink, { to: "/admin/reports", onClick: closeOnClick, className: "navitem", children: [_jsx("span", { className: "icon", children: "\uD83D\uDEA9" }), "Reports"] }), _jsxs(NavLink, { to: "/admin/analytics", onClick: closeOnClick, className: "navitem", children: [_jsx("span", { className: "icon", children: "\uD83D\uDCC8" }), "Analytics"] }), _jsxs(NavLink, { to: "/admin/settings", onClick: closeOnClick, className: "navitem", children: [_jsx("span", { className: "icon", children: "\u2699\uFE0F" }), "Settings"] })] })] }), _jsxs("div", { className: "portal-foot", children: [_jsxs("div", { className: "me", children: [_jsx("img", { src: "/Avatar.jpeg", alt: "Admin avatar" }), _jsxs("div", { children: [_jsx("div", { className: "name", children: name || "Admin" }), _jsx("div", { className: "muted", children: email || "—" })] })] }), _jsx("button", { className: "logout", onClick: handleLogout, children: "Logout" })] })] })] }));
}
