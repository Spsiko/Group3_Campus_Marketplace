import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../../style/login.scss"; // Stealing login styling for consistency
export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [working, setWorking] = useState(true);
    const [ready, setReady] = useState(false);
    const navigate = useNavigate(); //  To send user back to login
    //Get session from supabase URL
    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.auth.getSession();
            setWorking(false);
            setReady(!error && Boolean(data.session));
        })();
    }, []); //  Runs on page load/mount
    const submit = async (e) => {
        e.preventDefault(); // Page doesn't reload upon submit
        if (password !== confirm)
            return alert(`Passwords don't match`);
        const { error } = await supabase.auth.updateUser({ password }); //  Tries to update password
        if (error)
            return alert(error.message); //  Password update failed
        alert(`Pwassword updated`);
        navigate("/login");
    };
    if (working) { // validating Session
        return (_jsx("div", { className: "login-page", children: _jsx("div", { className: "login-card", children: _jsx("p", { children: "Loading..." }) }) }));
    }
    if (!ready) {
        return (_jsx("div", { className: "login-page", children: _jsxs("div", { className: "login-card", children: [_jsx("h2", { children: "Invalid or Expired Link" }), _jsx("p", { className: "small-text", children: "Please request a new password reset link." }), _jsx("button", { className: "back-btn", onClick: () => navigate("/forgot-password"), children: "Back to Forgot Password" })] }) }));
    }
    return (_jsx("div", { className: "login-page", children: _jsxs("div", { className: "login-card", children: [_jsx("h2", { children: "Reset Password" }), _jsx("p", { className: "small-text", children: "Enter and confirm new password" }), _jsxs("form", { onSubmit: submit, children: [_jsx("label", { children: "New Password" }), _jsx("input", { type: "password", placeholder: "Enter new password", value: password, onChange: (e) => setPassword(e.target.value), required: true }), _jsx("input", { type: "password", placeholder: "Confirm new password", value: confirm, onChange: (e) => setConfirm(e.target.value), required: true }), _jsx("button", { type: "submit", className: "login-btn", disabled: /*Add this eventually*/ false, children: "Submit" })] }), _jsx("div", { className: "divider", children: "OR" }), _jsx("button", { className: "back-btn", onClick: () => navigate("/login"), children: "Back to Login" })] }) }));
}
