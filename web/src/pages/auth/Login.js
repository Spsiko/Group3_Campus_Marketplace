import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// web/src/pages/auth/Login.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "../../style/login.scss";
const SETTINGS_KEY = "default";
export default function Login() {
    const [role, setRole] = useState("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [restrictions, setRestrictions] = useState(null);
    const [, setSettingsLoaded] = useState(false);
    const navigate = useNavigate();
    // Load restrictions from app_settings
    useEffect(() => {
        const loadSettings = async () => {
            const { data, error } = await supabase
                .from("app_settings")
                .select("restrictions")
                .eq("key", SETTINGS_KEY)
                .single();
            if (error) {
                console.warn("No app_settings row or error loading settings:", error.message);
            }
            if (data?.restrictions) {
                setRestrictions(data.restrictions);
            }
            else {
                setRestrictions({});
            }
            setSettingsLoaded(true);
        };
        loadSettings();
    }, []);
    const handleLogin = async (e) => {
        e.preventDefault();
        if (submitting)
            return;
        setSubmitting(true);
        try {
            const campusRequired = restrictions?.campusEmailRequired === true;
            // ✅ Only enforce .edu rule for STUDENT login
            if (role === "student" &&
                campusRequired &&
                !email.toLowerCase().endsWith(".edu")) {
                alert("Only campus (.edu) email addresses are allowed to use this marketplace.");
                return;
            }
            // 1) Authenticate against Supabase Auth (auth.users)
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError || !signInData?.user) {
                console.error("Auth login error:", signInError);
                // Give clearer message if email isn't confirmed yet
                const msg = signInError?.message?.toLowerCase() ?? "";
                if (msg.includes("email") && msg.includes("confirm")) {
                    alert("Please verify your email first. Check your inbox for the verification link.");
                }
                else {
                    alert("Invalid email or password.");
                }
                return;
            }
            const authUser = signInData.user;
            // 2) Ensure a matching row exists in public.users
            let profile = null;
            // 2a) Try by auth_user_id
            let { data: profileByAuth, error: profileAuthError } = await supabase
                .from("users")
                .select("*")
                .eq("auth_user_id", authUser.id)
                .maybeSingle();
            if (!profileAuthError && profileByAuth) {
                profile = profileByAuth;
            }
            else {
                // 2b) Try by email
                const { data: profileByEmail, error: profileEmailError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", authUser.email)
                    .maybeSingle();
                if (!profileEmailError && profileByEmail) {
                    // Link existing row to this auth user
                    const { data: updatedProfile, error: updateError } = await supabase
                        .from("users")
                        .update({ auth_user_id: authUser.id })
                        .eq("id", profileByEmail.id)
                        .select()
                        .single();
                    if (updateError || !updatedProfile) {
                        console.error("Error linking auth_user_id to existing user:", updateError);
                        alert("Login failed while linking your account. Please try again.");
                        return;
                    }
                    profile = updatedProfile;
                }
                else {
                    // 2c) No row at all → create one
                    const meta = (authUser.user_metadata || {});
                    const { data: newProfile, error: insertError } = await supabase
                        .from("users")
                        .insert([
                        {
                            full_name: meta.full_name || "",
                            email: authUser.email,
                            password, // ✅ satisfy NOT NULL on users.password
                            auth_user_id: authUser.id,
                            // role will use DB default; anything not 'admin' is treated as student
                        },
                    ])
                        .select()
                        .single();
                    if (insertError || !newProfile) {
                        console.error("Error creating profile in public.users:", insertError);
                        alert("Login failed while creating your profile. Please try again.");
                        return;
                    }
                    profile = newProfile;
                }
            }
            // 3) Role check for admin tab
            if (role === "admin" && profile.role !== "admin") {
                alert("This account is not an admin.");
                return;
            }
            // 4) Record login event for analytics (non-blocking)
            try {
                await supabase.from("user_logins").insert({
                    user_id: profile.id,
                });
            }
            catch (logErr) {
                console.error("Failed to record login event", logErr);
            }
            // 5) Persist a lightweight session for the UI
            const effectiveRole = profile.role === "admin" ? "admin" : "student";
            localStorage.setItem("cm_user", JSON.stringify({
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                role: effectiveRole,
            }));
            // 6) Route by role
            if (effectiveRole === "admin") {
                navigate("/admin", { replace: true });
            }
            else {
                navigate("/student/dashboard", { replace: true });
            }
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsx("div", { className: "login-page", children: _jsxs("div", { className: "login-card", children: [_jsxs("div", { className: "role-tabs", children: [_jsx("button", { className: role === "student" ? "active" : "", "data-testid": "role-student", onClick: () => setRole("student"), type: "button", children: "Student" }), _jsx("button", { className: role === "admin" ? "active" : "", "data-testid": "role-admin", onClick: () => setRole("admin"), type: "button", children: "Admin" })] }), _jsx("h2", { children: role === "student" ? "Student Login" : "Admin Login" }), _jsxs("form", { onSubmit: handleLogin, children: [_jsx("label", { children: "Email Address *" }), _jsx("input", { "data-testid": "login-email", type: "email", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "username", required: true }), _jsx("label", { children: "Password *" }), _jsx("input", { "data-testid": "login-password", type: "password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password", required: true }), _jsx("p", { className: "forgot-password-link", onClick: () => navigate("/forgot-password"), children: "Forgot Password?" }), _jsx("button", { type: "submit", className: "login-btn", "data-testid": "login-submit", disabled: submitting, children: submitting ? "Logging in..." : "Log In" })] }), _jsx("div", { className: "divider", children: "OR" }), _jsxs("button", { className: "google-btn", type: "button", children: [_jsx("img", { src: "/Google-icon.jpeg", alt: "Google" }), "Sign in with Google"] }), _jsx("button", { className: "back-btn", onClick: () => navigate("/"), type: "button", children: "Back to Landing Page" })] }) }));
}
