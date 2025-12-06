import { useEffect, useState } from "react";
import "../../style/StudentProfile.scss";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUser } from "../../lib/resolvedUser";
import { signOut } from "../../lib/auth";

export default function StudentProfile() {
  const [authUser, setAuthUser] = useState<any>(null);

  const [tab, setTab] = useState<"profile" | "settings">("profile");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [myListings, setMyListings] = useState<any[]>([]);

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
    if (!authUser || !authUser.auth_user_id) return;

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

      if (data) setMyListings(data);
    };

    loadProfile();
    loadListings();
  }, [authUser]);

  // ------------------------------------------
  // Upload avatar
  // ------------------------------------------
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser) return;

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
  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

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
    } else {
      alert("Profile updated");
    }
  };

  // ------------------------------------------
  // Change Password (DB + localStorage)
  // ------------------------------------------
  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

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
    localStorage.setItem(
      "cm_user",
      JSON.stringify({ ...authUser, password: newPassword })
    );

    setPwMessage("Password updated successfully");
    setNewPassword("");
  };

  // ------------------------------------------
  // Deactivate account (RLS safe)
  // ------------------------------------------
  const onDeactivate = async () => {
    if (!authUser) return;

    const yes = confirm("Are you sure?");
    if (!yes) return;

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
    return <p style={{ padding: 20 }}>Loading profile...</p>;

  return (
    <section className="student-profile">
      <div className="card">

<div className="tabs-row">
  <div className="tabs">
    <button
      className={`tab ${tab === "profile" ? "is-active" : ""}`}
      onClick={() => setTab("profile")}
    >
      Profile
    </button>

    <button
      className={`tab ${tab === "settings" ? "is-active" : ""}`}
      onClick={() => setTab("settings")}
    >
      Settings
    </button>
  </div>

  <button
    className="logout-btn"
    onClick={() => {
      signOut();
      supabase.auth.signOut();
      window.location.href = "/login";
    }}
  >
    Logout
  </button>
</div>


        {/* PROFILE TAB */}
        {tab === "profile" && (
          <form className="form" onSubmit={onSaveProfile}>
            <h1>My Profile</h1>

            <div className="avatar-row">
              <img
                className="avatar"
                src={avatarPreview || "/Avatar.jpeg"}
                alt="Avatar"
              />
              <label className="upload">
                Change Photo
                <input type="file" accept="image/*" onChange={onAvatarChange} />
              </label>
            </div>

            <div className="grid">
              <div className="field">
                <label>Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input value={email} disabled />
              </div>
            </div>

            <div className="actions">
              <button className="btn primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <h2 style={{ marginTop: 30 }}>My Listings</h2>
            <div className="listings-grid">
              {myListings.map((l) => (
                <div key={l.id} className="listing-card">
                  <img
                    src={l.image_urls?.[0] || "/placeholder.jpg"}
                    alt={l.title}
                  />
                  <h4>{l.title}</h4>
                  <p>${l.price}</p>
                </div>
              ))}
              {myListings.length === 0 && <p>No listings yet.</p>}
            </div>
          </form>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <div className="settings">
            <h1>Settings</h1>

            <div className="setting-section">
              <h3>Change Password</h3>
              <form onSubmit={onChangePassword}>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button className="btn primary small">Update Password</button>
                {pwMessage && <p>{pwMessage}</p>}
              </form>
            </div>

            <div className="setting-section danger">
              <h3>Deactivate Account</h3>
              <button className="btn danger" onClick={onDeactivate}>
                Deactivate My Account
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
