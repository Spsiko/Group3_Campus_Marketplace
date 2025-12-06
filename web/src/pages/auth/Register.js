import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "../../style/register.scss";
const SETTINGS_KEY = "default";
export default function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [restrictions, setRestrictions] = useState(null);
    const [, setSettingsLoaded] = useState(false);
    // Load restrictions from app_settings so we know if .edu is required
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
    const handleRegister = async (e) => {
        e.preventDefault();
        if (submitting)
            return;
        setSubmitting(true);
        try {
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }
            const campusRequired = restrictions?.campusEmailRequired === true;
            if (campusRequired && !email.toLowerCase().endsWith(".edu")) {
                alert("You must use a campus (.edu) email address to create an account.");
                return;
            }
            // 1) Create user in Supabase Auth (auth.users)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                },
            });
            if (authError || !authData?.user) {
                console.error("Auth signUp error:", authError);
                alert(authError?.message || "Error creating account.");
                return;
            }
            const authUser = authData.user;
            // 2) Upsert matching entry in public.users (insert or update by email)
            //    IMPORTANT: include `password` here because your column is NOT NULL.
            const { error: profileError } = await supabase
                .from("users")
                .upsert({
                full_name: name,
                email,
                password, // ✅ satisfies NOT NULL constraint
                auth_user_id: authUser.id,
                // DO NOT send role here; let DB default / existing value handle it
            }, {
                onConflict: "email", // uses your users_email_unique constraint
            });
            if (profileError) {
                console.error("Error saving data in public.users:", profileError);
                alert("Your account was created, but we had trouble saving your profile: " +
                    profileError.message);
                return;
            }
            // 3) Tell user to verify email then log in
            alert("Registration successful! Please check your email to verify your account before logging in.");
            navigate("/login");
        }
        finally {
            setSubmitting(false);
        }
    };
    // Google sign-in handler
    const handleGoogleSignIn = async () => {
        if (submitting)
            return;
        setSubmitting(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/register`
                }
            });
            if (error) {
                console.error("Google sign-in error:", error);
                alert(`Google sign-in failed: ${error.message}`);
            }
            // On success, Supabase will redirect to Google, then back to our app
        }
        catch (err) {
            console.error("Unexpected Google sign-in error:", err);
            alert("Something went wrong during Google sign-in. Please try again.");
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsx("div", { className: "register-page", children: _jsxs("div", { className: "register-card", children: [_jsx("h2", { children: "Student Sign Up" }), _jsxs("form", { onSubmit: handleRegister, children: [_jsx("label", { children: "Full Name *" }), _jsx("input", { type: "text", placeholder: "Enter your full name", value: name, onChange: (e) => setName(e.target.value), "data-testid": "register-name", required: true }), _jsx("label", { children: "Email Address *" }), _jsx("input", { type: "email", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), "data-testid": "register-email", required: true }), _jsx("label", { children: "Password *" }), _jsx("input", { type: "password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), "data-testid": "register-password", required: true }), _jsx("label", { children: "Confirm Password *" }), _jsx("input", { type: "password", placeholder: "Confirm your password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), "data-testid": "register-confirm", required: true }), _jsx("button", { type: "submit", className: "register-btn", "data-testid": "register-submit", disabled: submitting, children: submitting ? "Signing up..." : "Sign Up" })] }), _jsx("div", { className: "divider", children: "OR" }), _jsxs("button", { className: "google-btn", type: "button", onClick: handleGoogleSignIn, disabled: submitting, children: [_jsx("img", { src: "/Google-icon.jpeg", alt: "Google" }), "Sign up with Google"] }), _jsx("button", { className: "back-btn", onClick: () => navigate("/login"), children: "Already have an account? Log In" }), _jsx("button", { className: "back-btn", onClick: () => navigate("/"), children: "Back to Landing Page" })] }) }));
}
