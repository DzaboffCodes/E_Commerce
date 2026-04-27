import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
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

function OrderPayForm({ orderId, total }) {
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
      const intentRes = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/payment-intent`, {
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
        const confirmRes = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/confirm-payment`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });
        const confirmData = await confirmRes.json();
        if (!confirmRes.ok) throw new Error(confirmData?.message || "Failed to confirm payment");
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

function OrderPayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [total, setTotal] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/${id}`, {
          credentials: "include",
        });
        if (res.status === 401) { navigate("/login"); return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Order not found");
        const order = data?.data?.order;
        if (order.status !== "pending") { navigate("/orders"); return; }
        setTotal(order.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id, navigate]);

  if (loading) return <p className="checkout-feedback">Loading...</p>;
  if (error) return <p className="checkout-feedback">{error}</p>;

  return (
    <section className="checkout-page">
      <h1>Pay for Order #{id}</h1>
      <div className="checkout-layout">
        <div className="checkout-summary">
          <h2>Order Total</h2>
          <p className="checkout-total">Total: <strong>${Number(total).toFixed(2)}</strong></p>
        </div>
        <div className="checkout-payment">
          <h2>Payment Details</h2>
          <Elements stripe={stripePromise}>
            <OrderPayForm orderId={id} total={total} />
          </Elements>
        </div>
      </div>
    </section>
  );
}

export default OrderPayPage;