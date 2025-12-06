import { useCart } from "../../context/CartContext";
import "../../style/studentcart.scss";

export default function StudentCart() {
  const { cart, removeFromCart, clearCart } = useCart();

  const totalPrice = cart.reduce((sum, item) => {
    const price = item.price;
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  return (
    <section className="student-cart">
      <div className="sc-container">
        <h1 className="sc-title">Your Cart ({cart.length} items)</h1>

        {cart.length === 0 ? (
          <div className="sc-empty">
            <p>No items yet.</p>
            <a href="/student/listings" className="sc-btn sc-btn--gold">
              Browse Listings
            </a>
          </div>
        ) : (
          <>
            <ul className="sc-list">
              {cart.map((item) => (
                <li key={item.id} className="sc-item">
                  <div className="sc-info">
                    <img src={item.image} alt={item.title} className="sc-img" />
                    <div className="sc-details">
                      <p className="sc-name">{item.title}</p>
                      <p className="sc-price">{item.price}</p>
                    </div>
                  </div>

                  <button
                    className="sc-remove"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="sc-footer">
              <p className="sc-total">
                Total: <span>${totalPrice.toFixed(2)}</span>
              </p>

              <div className="sc-actions">
                <button className="sc-btn sc-btn--gold" onClick={clearCart}>
                  Clear Cart
                </button>
                <button className="sc-btn sc-btn--checkout">Checkout</button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
