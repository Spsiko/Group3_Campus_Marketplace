import { useCart } from "../../context/CartContext";
import "../../style/StudentCheckout.scss";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../lib/auth";

export default function Checkout() {
  const { cart } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  async function handlePlaceOrder() {
    const user = getUser();
    if (!user || !user.id) {
      alert("Please login before checking out.");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      // ------------------------------------------------------
      // 1. PREPARE ITEMS FOR EDGE FUNCTION (correct format)
      // ------------------------------------------------------
      const items = cart.map((item) => ({
        title: item.title,
        price: Number(item.price),
        quantity: Number(item.quantity || 1),
      }));

      console.log("Sending payload to Stripe function:", items);

      // ------------------------------------------------------
      // 2. CALL SUPABASE EDGE FUNCTION
      // ------------------------------------------------------
      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: { items },
        }
      );

      if (error) {
        console.error("Stripe session error:", error);
        alert("Payment initialization failed.");
        return;
      }

      if (!data?.url) {
        console.error("Stripe did not return URL:", data);
        alert("Stripe did not return a redirect URL.");
        return;
      }

      // ------------------------------------------------------
      // 3. REDIRECT TO STRIPE CHECKOUT
      // ------------------------------------------------------
      window.location.href = data.url;

    } catch (err) {
      console.error("Checkout error:", err);
      alert("Unexpected error during checkout.");
    }
  }

  return (
    <div className="checkout-page">

      <h1>Checkout</h1>

      {/* ---------------------------------------------------- */}
      {/* CART ITEMS */}
      {/* ---------------------------------------------------- */}
      <div className="checkout-items">
        {cart.map((item) => (
          <div className="checkout-item" key={item.id}>
            <img src={item.image} alt={item.title} />
            <div>
              <div className="title">{item.title}</div>
              <div className="price">
                ${item.price} × {item.quantity}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUMMARY */}
      {/* ---------------------------------------------------- */}
      <div className="checkout-summary">
        <h2>Order Summary</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* ORDER BUTTON */}
      {/* ---------------------------------------------------- */}
      <button
        className="btn primary checkout-confirm-btn"
        onClick={handlePlaceOrder}
      >
        Proceed to Payment
      </button>

    </div>
  );
}
