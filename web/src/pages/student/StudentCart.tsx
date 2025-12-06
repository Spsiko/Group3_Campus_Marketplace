import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../../style/studentcart.scss";

/*
type CartItem = {
  id: string;               // the Supabase listing UUID
  image?: string;
  title: string;
  price: number;
  seller_id: string;        // optional but useful for seller dashboard
};
*/

export default function StudentCart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

  function handleCheckout() {
    navigate("/student/checkout");
  }

  return (
    <section className="student-cart">
      <h1>Your Cart</h1>

      <div className="student-cart__layout">

        <div className="student-cart__items">
          {cart.map((item) => (
            <div key={item.id} className="student-cart__item">
              <img src={item.image ?? ""} alt={item.title} />
              <div>
                <h3>{item.title}</h3>
                <p>${item.price.toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="student-cart__empty">Your cart is empty.</div>
          )}
        </div>

        <div className="student-cart__summary">
          <h2>Order Summary</h2>
          <p>Items: {cart.length}</p>
          <p>Subtotal: ${subtotal.toFixed(2)}</p>

          <button
            type="button"
            className="btn primary student-cart__checkout-btn"
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Proceed to Checkout
          </button>

          <button type="button" className="btn ghost" onClick={clearCart}>
            Clear Cart
          </button>
        </div>

      </div>
    </section>
  );
}
