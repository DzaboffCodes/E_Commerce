import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CartPage.css";

function CartPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      setError("");

      try {
        const cartId = localStorage.getItem("activeCartId");

        if (!cartId) {
          setItems([]);
          setTotal("0.00");
          return;
        }

        const response = await fetch(`http://localhost:3000/cart/${cartId}`, {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            localStorage.removeItem("activeCartId");
            setItems([]);
            setTotal("0.00");
            return;
          }

          throw new Error(data?.message || "Unable to load cart");
        }

        setItems(data?.data?.items || []);
        setTotal(data?.data?.total || "0.00");
      } catch (err) {
        setError(err.message || "Unable to load cart");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [navigate]);

  if (loading) {
    return (
      <section className="cart-page">
        <div className="cart-feedback">
          <p>Loading your cart...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="cart-page">
        <div className="cart-feedback">
          <p>{error}</p>
          <Link to="/products" className="cart-link">
            Back to shopping
          </Link>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="cart-page">
        <h1>Your Cart</h1>
        <p className="cart-page-intro">Everything you want to buy will show up here.</p>

        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <Link to="/products" className="cart-link">
            Continue shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <h1>Your Cart</h1>
      <p className="cart-page-intro">Review your selected items before checkout.</p>

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.cart_item_id} className="cart-item">
              <div className="cart-item-main">
                <h3 className="cart-item-title">{item.product_name}</h3>

                <div className="cart-meta">
                  <span className="cart-meta-chip">Qty: {item.qty}</span>
                  <span className="cart-meta-chip">
                    Price: ${Number(item.price).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="cart-subtotal">
                <p className="cart-subtotal-label">Subtotal</p>
                <p className="cart-subtotal-value">
                  ${Number(item.subtotal).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <aside className="cart-summary">
          <h2 className="cart-summary-heading">Order Summary</h2>

          <div className="cart-summary-row">
            <span>Items</span>
            <span>{items.length}</span>
          </div>

          <div className="cart-summary-row cart-summary-total">
            <span className="label">Total</span>
            <span className="value">${Number(total).toFixed(2)}</span>
          </div>

          <div className="cart-actions">
            <button type="button" className="cart-btn cart-btn-primary">
              Proceed to Checkout
            </button>

            <Link to="/products" className="cart-btn cart-btn-secondary">
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CartPage;