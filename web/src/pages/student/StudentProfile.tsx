// src/pages/student/StudentProfile.tsx

import { useEffect, useState } from "react";
import "../../style/studentprofile.scss";
import "../../style/SellerOrders.scss";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUser } from "../../lib/resolvedUser";
import { signOut } from "../../lib/auth";

type SoldListing = {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function StudentProfile() {
  const [authUser, setAuthUser] = useState<any>(null);

  const [tab, setTab] =
    useState<"profile" | "settings" | "listings" | "sold">("profile");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [myListings, setMyListings] = useState<any[]>([]);
  const [soldListings, setSoldListings] = useState<SoldListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingSold, setLoadingSold] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [pwMessage, setPwMessage] = useState("");

  // ----------------------------------------------------------
  // Load resolved user
  // ----------------------------------------------------------
  useEffect(() => {
    async function loadUser() {
      const u = await getResolvedUser();
      setAuthUser(u || null);
    }
    loadUser();
  }, []);

  // ----------------------------------------------------------
  // Load Profile + Listings + Sold Listings
  // ----------------------------------------------------------
  useEffect(() => {
    if (!authUser || !authUser.auth_user_id) return;

    // Profile load
    async function loadProfile() {
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
    }

    // Load listings
    async function loadListings() {
      setLoadingListings(true);
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, created_at, image_urls, status")
        .eq("seller_id", authUser.auth_user_id)
        .order("created_at", { ascending: false });

      if (data) setMyListings(data);
      setLoadingListings(false);

      
    }

    // Load sold listings
    async function loadSoldListings() {
      setLoadingSold(true);
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, status, created_at, updated_at")
        .eq("seller_id", authUser.auth_user_id)
        .eq("status", "sold")
        .order("updated_at", { ascending: false });

      if (data) setSoldListings(data);
      setLoadingSold(false);
    }

    loadProfile();
    loadListings();
    loadSoldListings();
  }, [authUser]);

  // ----------------------------------------------------------
  // Save profile changes
  // ----------------------------------------------------------
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

    if (error) alert("Failed to update profile");
    else alert("Profile updated");
  };

  // ----------------------------------------------------------
  // Change Password
  // ----------------------------------------------------------
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
      .eq("auth_user_id", authUser.auth_user_id);

    if (error) {
      setPwMessage("Password update failed");
      return;
    }

    // update local storage
    localStorage.setItem(
      "cm_user",
      JSON.stringify({ ...authUser, password: newPassword })
    );

    setPwMessage("Password updated successfully");
    setNewPassword("");
  };

  // ----------------------------------------------------------
// Deactivate Account (RLS-safe)
// ----------------------------------------------------------
const onDeactivate = async () => {
  if (!authUser) return;

  const yes = confirm("Are you sure you want to deactivate your account?");
  if (!yes) return;

  // Mark user inactive
  const { error } = await supabase
    .from("users")
    .update({
      is_active: false,
      status: "inactive",
      deleted_at: new Date().toISOString(),
    })
    .eq("auth_user_id", authUser.auth_user_id);

  if (error) {
    alert("Account deactivation failed.");
    return;
  }

  // Log out locally + Supabase session
  signOut();
  supabase.auth.signOut();

  window.location.href = "/login";
};


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  if (!authUser)
    return <p style={{ padding: 20 }}>Loading profile...</p>;

  return (
    <section className="student-profile">
      <div className="card">

        {/* ---------------- TABS ---------------- */}
        <div className="tabs-row">
          <div className="tabs">
            <button className={`tab ${tab === "profile" ? "is-active" : ""}`} onClick={() => setTab("profile")}>
              Profile
            </button>

            <button className={`tab ${tab === "listings" ? "is-active" : ""}`} onClick={() => setTab("listings")}>
              Listings
            </button>

            <button className={`tab ${tab === "sold" ? "is-active" : ""}`} onClick={() => setTab("sold")}>
              Sold Listings
            </button>

            <button className={`tab ${tab === "settings" ? "is-active" : ""}`} onClick={() => setTab("settings")}>
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

        {/* ---------------- PROFILE TAB ---------------- */}
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = () => setAvatarPreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>

            <div className="grid">
              <div className="field">
                <label>Full Name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
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
          </form>
        )}

        {/* ---------------- LISTINGS TAB ---------------- */}
        {tab === "listings" && (
          <div className="listings-section">
            <h2>My Listings</h2>

            {loadingListings ? (
              <p>Loading listings...</p>
            ) : myListings.length === 0 ? (
              <p>No listings yet.</p>
            ) : (
              <div className="listings-grid">
                {myListings.map((l) => (
                  <div key={l.id} className="listing-card">
                    <img src={l.image_urls?.[0] || "/placeholder.jpg"} alt={l.title} />
                    <h4>{l.title}</h4>
                    <p>${Number(l.price).toFixed(2)}</p>
                    <p>Status: {l.status}</p>
                    {/*
                    <button className="btn primary" onClick={() => (window.location.href = "/student/editlistings")}> Edit My Listings </button>
                    */}

<button
  className={`tab ${tab === "listings" ? "is-active" : ""}`}
  onClick={() => (window.location.href = "/student/mylistings")}
>
  Edit
</button>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------- SOLD LISTINGS TAB ---------------- */}
        {tab === "sold" && (
          <div className="seller-orders-page">
            <h2>Sold Listings</h2>

            {loadingSold ? (
              <p>Loading sold items...</p>
            ) : soldListings.length === 0 ? (
              <p>No sold items yet.</p>
            ) : (
              <div className="orders-list">
                {soldListings.map((item) => (
                  <div key={item.id} className="order-card">
                    <div className="order-header">
                      <h3>{item.title}</h3>
                      <span className="status-badge status-sold">{item.status}</span>
                    </div>

                    <div className="order-meta">
                      <p><strong>Price:</strong> ${Number(item.price).toFixed(2)}</p>
                      <p><strong>Listed On:</strong> {new Date(item.created_at).toLocaleString()}</p>
                      <p><strong>Sold On:</strong> {new Date(item.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------- SETTINGS TAB ---------------- */}
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
              </form>

              {pwMessage && <p>{pwMessage}</p>}
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
