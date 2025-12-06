import "../style/studentheader.scss";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingCart, User } from "lucide-react"; // lightweight icons
import NotificationBell from "../components/NotificationBell";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

export default function StudentHeader({ open, setOpen }: Props) {
    const { cart } = useCart();
  return (
    <header className="student-header">
      <button
        className="brand"
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Toggle admin sidebar"
      >
        Campus Marketplace
      </button>
      <div /> 

      {/*new addition*/}

      

      {/* Right: Cart + Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {/* Cart */}
        <Link
          to="/student/cart"
          style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
        >
          <ShoppingCart size={22} color="#111827" />
          {cart.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-6px",
                right: "-10px",
                background: "#d4b483",
                color: "#111",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "999px",
                padding: "2px 6px",
                lineHeight: 1,
              }}
            >
              {cart.length}
            </span>
          )}
        </Link>

        <NotificationBell />

        {/* Profile */}
        <Link
          to="/student/profile"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "999px",
            background: "#f3f4f6",
            color: "#111827",
            textDecoration: "none",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => ((e.currentTarget.style.background = "#e5e7eb"))}
          onMouseLeave={(e) => ((e.currentTarget.style.background = "#f3f4f6"))}
        >
          <User size={18} />
        </Link>
      </div>
    </header>
  );
}
