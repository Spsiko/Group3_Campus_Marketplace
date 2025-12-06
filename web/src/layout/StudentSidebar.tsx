import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../style/studentsidebar.scss";
import { supabase } from "../lib/supabaseClient";

type Props = {
  open: boolean;
  onClose?: () => void;
};

type StoredUser = { id?: string; email?: string; full_name?: string; role?: string };

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("cm_user");
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export default function StudentSidebar({ open, onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("Student");
  const [email, setEmail] = useState("");

  const loadProfile = useCallback(async () => {
    const s = getStoredUser();
    if (s?.full_name) setName(s.full_name);
    if (s?.email) setEmail(s.email);

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
    } catch {}
  }, []);

  useEffect(() => {
    loadProfile();
    const onStorage = (e: StorageEvent) => e.key === "cm_user" && loadProfile();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadProfile]);

  // CLOSE THE SIDEBAR ON ANY ROUTE CHANGE
  useEffect(() => {
    if (open && onClose) onClose();
  }, [location.pathname]);

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch {}
    localStorage.removeItem("cm_user");
    navigate("/login", { replace: true });
  };

  // CLOSE ON NAV CLICK
  const closeOnClick = () => onClose?.();

  return (
    <>
      {open && <div className="portal-overlay" onClick={onClose} />}

      <aside className={`portal ${open ? "open" : ""}`} aria-label="Student sidebar">
        <div>
          <div className="portal-head">Student Portal</div>
          <nav className="portal-nav">
            <NavLink to="/student/dashboard" onClick={closeOnClick} className="navitem">
              Dashboard
            </NavLink>
            <NavLink to="/student/sell" onClick={closeOnClick} className="navitem">
              Sell
            </NavLink>
            <NavLink to="/student/listings" onClick={closeOnClick} className="navitem">
              Listings
            </NavLink>
            <NavLink to="/student/messages" onClick={closeOnClick} className="navitem">
              Messages
            </NavLink>
            <NavLink to="/student/profile" onClick={closeOnClick} className="navitem">
              Profile
            </NavLink>
            <NavLink to="/student/Orders" onClick={closeOnClick} className="navitem">
              My Orders
            </NavLink>
            <NavLink to="/student/SellerOrders" onClick={closeOnClick} className="navitem">
              Seller Orders
            </NavLink>
            <NavLink to="/student/MyListings" onClick={closeOnClick} className="navitem">
              My Listings
            </NavLink>
          </nav>
        </div>

        <div className="portal-foot">
          <div className="me">
            <img src="/Avatar.jpeg" alt="Student avatar" />
            <div>
              <div className="name">{name || "Student"}</div>
              <div className="muted">{email || "—"}</div>
            </div>
          </div>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
    </>
  );
}
