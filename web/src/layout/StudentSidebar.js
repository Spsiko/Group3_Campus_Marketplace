import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../style/StudentSidebar.scss";
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
export default function StudentSidebar({ open, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [name, setName] = useState("Student");
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
                    setName(data.full_name || s.full_name || "Student");
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
                    setName(data.full_name || "Student");
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
    return (_jsxs(_Fragment, { children: [open && _jsx("div", { className: "portal-overlay", onClick: onClose }), _jsxs("aside", { className: `portal ${open ? "open" : ""}`, "aria-label": "Student sidebar", children: [_jsxs("div", { children: [_jsx("div", { className: "portal-head", children: "Student Portal" }), _jsxs("nav", { className: "portal-nav", children: [_jsx(NavLink, { to: "/student/dashboard", onClick: closeOnClick, className: "navitem", children: "Dashboard" }), _jsx(NavLink, { to: "/student/sell", onClick: closeOnClick, className: "navitem", children: "Sell" }), _jsx(NavLink, { to: "/student/listings", onClick: closeOnClick, className: "navitem", children: "Listings" }), _jsx(NavLink, { to: "/student/messages", onClick: closeOnClick, className: "navitem", children: "Messages" }), _jsx(NavLink, { to: "/student/profile", onClick: closeOnClick, className: "navitem", children: "Profile" }), _jsx(NavLink, { to: "/student/Orders", onClick: closeOnClick, className: "navitem", children: "My Orders" })] })] }), _jsxs("div", { className: "portal-foot", children: [_jsxs("div", { className: "me", children: [_jsx("img", { src: "/Avatar.jpeg", alt: "Student avatar" }), _jsxs("div", { children: [_jsx("div", { className: "name", children: name || "Student" }), _jsx("div", { className: "muted", children: email || "—" })] })] }), _jsx("button", { className: "logout", onClick: handleLogout, children: "Logout" })] })] })] }));
}
