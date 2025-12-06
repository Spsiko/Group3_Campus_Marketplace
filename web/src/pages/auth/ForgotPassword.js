import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "../../style/login.scss";
export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const handleReset = async (e) => {
        e.preventDefault();
        // Supabase built-in reset password method
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "http://localhost:5173/reset-password", // Adjust as needed
        });
        if (error) {
            alert("Error: " + error.message);
        }
        else {
            alert("Password reset link sent to your email!");
            navigate("/login");
        }
    };
    return (_jsx("div", { className: "login-page", children: _jsxs("div", { className: "login-card", children: [_jsx("h2", { children: "Forgot Password" }), _jsx("p", { className: "small-text", children: "Enter your registered email to receive a password reset link." }), _jsxs("form", { onSubmit: handleReset, children: [_jsx("label", { children: "Email Address *" }), _jsx("input", { type: "email", placeholder: "Enter your registered email", value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx("button", { type: "submit", className: "login-btn", children: "Send Reset Link" })] }), _jsx("button", { className: "back-btn", onClick: () => navigate("/login"), children: "Back to Login" })] }) }));
}
