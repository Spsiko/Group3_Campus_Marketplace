import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "../../style/register.scss";

type Restrictions = {
  campusEmailRequired?: boolean;
  requireEmailVerification?: boolean;
  maxActiveListings?: number;
};

const SETTINGS_KEY = "default";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [restrictions, setRestrictions] = useState<Restrictions | null>(null);
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
        setRestrictions(data.restrictions as Restrictions);
      } else {
        setRestrictions({});
      }
      setSettingsLoaded(true);
    };

    loadSettings();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
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
        .upsert(
          {
            full_name: name,
            email,
            password, // ✅ satisfies NOT NULL constraint
            auth_user_id: authUser.id,
            // DO NOT send role here; let DB default / existing value handle it
          },
          {
            onConflict: "email", // uses your users_email_unique constraint
          }
        );

      if (profileError) {
        console.error("Error saving data in public.users:", profileError);
        alert(
          "Your account was created, but we had trouble saving your profile: " +
            profileError.message
        );
        return;
      }

      // 3) Tell user to verify email then log in
      alert(
        "Registration successful! Please check your email to verify your account before logging in."
      );
      navigate("/login");
    } finally {
      setSubmitting(false);
    }
  };

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    if (submitting) return;
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
    } catch (err) {
      console.error("Unexpected Google sign-in error:", err);
      alert("Something went wrong during Google sign-in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Student Sign Up</h2>

        <form onSubmit={handleRegister}>
          <label>Full Name *</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="register-name"
            required
          />

          <label>Email Address *</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="register-email"
            required
          />

          <label>Password *</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="register-password"
            required
          />

          <label>Confirm Password *</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            data-testid="register-confirm"
            required
          />

          <button
            type="submit"
            className="register-btn"
            data-testid="register-submit"
            disabled={submitting}
          >
            {submitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="divider">OR</div>

        <button
          className="google-btn"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting}
        >
          <img src="/Google-icon.jpeg" alt="Google" />
          Sign up with Google
        </button>

        <button className="back-btn" onClick={() => navigate("/login")}>
          Already have an account? Log In
        </button>

        <button className="back-btn" onClick={() => navigate("/")}>
          Back to Landing Page
        </button>
      </div>
    </div>
  );
}
