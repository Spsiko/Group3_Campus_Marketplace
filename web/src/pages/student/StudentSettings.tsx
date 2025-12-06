import { useState } from "react";
import "../../style/studentsettings.scss";

export default function StudentProfile() {
  const [tab, setTab] = useState<"profile" | "settings">("profile");
  const [fullName, setFullName] = useState("Student User");
  const [email] = useState("student@campus.com");
  const [bio, setBio] = useState(
    "Passionate about sustainable design and reusing campus resources."
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      alert("Profile updated!");
      setSaving(false);
    }, 1000);
  };

  return (
    <section className="student-profile">
      <div className="card">
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

        {tab === "profile" && (
          <form className="form" onSubmit={onSaveProfile}>
            <h1>My Profile</h1>

            <div className="avatar-row">
              <img
                className="avatar"
                src={avatarPreview || "/avatar-placeholder.png"}
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
                  required
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input value={email} disabled />
                <small className="muted">Email cannot be changed.</small>
              </div>

              <div className="field span-2">
                <label>Bio</label>
                <textarea
                  placeholder="Tell others a bit about yourself, your interests, or what you sell most often..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="actions">
              <button className="btn primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {tab === "settings" && (
          <div className="settings">
            <h1>Account Settings</h1>
            <p className="muted-sub">
              Manage your preferences, privacy, and notifications.
            </p>

            <div className="setting-section">
              <h3>Notifications</h3>
              <div className="setting-row">
                <label>Email Notifications</label>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="setting-row">
                <label>Message Alerts</label>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="setting-row">
                <label>Weekly Summary</label>
                <input type="checkbox" />
              </div>
            </div>

            <div className="setting-section">
              <h3>Privacy</h3>
              <div className="setting-row">
                <label>Show my profile publicly</label>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="setting-row">
                <label>Allow direct messages from anyone</label>
                <input type="checkbox" />
              </div>
            </div>

            <div className="setting-section">
              <h3>Account</h3>
              <div className="setting-row">
                <label>Change Password</label>
                <button className="btn ghost small">Send Reset Link</button>
              </div>
              <div className="setting-row danger">
                <label>Delete Account</label>
                <button className="btn danger small">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
