import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./CheckoutPage.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const stripeInputStyle = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1f2937",
      fontFamily: "inherit",
      "::placeholder": { color: "#94a3b8" },
    },
    invalid: { color: "#b91c1c" },
  },
};

function CheckoutForm({ cartId, total }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    try {
      const intentRes = await fetch(`${import.meta.env.VITE_API_URL}/cart/${cartId}/payment-intent`, {
        method: "POST",
        credentials: "include",
      });
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData?.message || "Failed to initialize payment");

      const { clientSecret } = intentData.data;

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardNumberElement) },
      });

      if (stripeError) throw new Error(stripeError.message);

      if (paymentIntent.status === "succeeded") {
        const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/cart/${cartId}/checkout`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ paymentIntentId: paymentIntent.id})
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData?.message || "Failed to place order");

        localStorage.removeItem("activeCartId");
        navigate("/orders");
      }
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <div className="checkout-field-group">
        <label className="checkout-label">Card Number</label>
        <div className="checkout-stripe-input">
          <CardNumberElement options={stripeInputStyle} />
        </div>
      </div>

      <div className="checkout-field-row">
        <div className="checkout-field-group">
          <label className="checkout-label">Expiry Date</label>
          <div className="checkout-stripe-input">
            <CardExpiryElement options={stripeInputStyle} />
          </div>
        </div>

        <div className="checkout-field-group">
          <label className="checkout-label">CVC</label>
          <div className="checkout-stripe-input">
            <CardCvcElement options={stripeInputStyle} />
          </div>
        </div>
      </div>

      {error && <p className="checkout-error">{error}</p>}

      <button className="checkout-pay-btn" type="submit" disabled={!stripe || processing}>
        {processing ? "Processing..." : `Pay $${Number(total).toFixed(2)}`}
      </button>
    </form>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const [total, setTotal] = useState("0.00");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const cartId = localStorage.getItem("activeCartId");

  useEffect(() => {
    if (!cartId) { navigate("/cart"); return; }

    const loadCart = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/cart/${cartId}`, {
          credentials: "include",
        });
        if (res.status === 401) { navigate("/login"); return; }
        const data = await res.json();
        if (!res.ok || !data?.data?.items?.length) { navigate("/cart"); return; }
        setItems(data.data.items);
        setTotal(data.data.total);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [cartId, navigate]);

  if (loading) return <p className="checkout-feedback">Loading...</p>;

  return (
    <section className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <ul className="checkout-items">
            {items.map((item) => (
              <li key={item.cart_item_id} className="checkout-item-row">
                <span className="checkout-item-name">{item.product_name}</span>
                <span className="checkout-item-meta">{item.qty} × ${Number(item.price).toFixed(2)}</span>
                <span className="checkout-item-subtotal">${Number(item.subtotal).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="checkout-total-row">
            <span>Total</span>
            <span>${Number(total).toFixed(2)}</span>
          </div>
        </div>

        <div className="checkout-payment">
          <h2>Payment</h2>
          <Elements stripe={stripePromise}>
            <CheckoutForm cartId={cartId} total={total} />
          </Elements>
        </div>
      </div>
    </section>
  );
}

export default CheckoutPage;