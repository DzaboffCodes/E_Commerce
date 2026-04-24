import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./OrdersPage.css";

function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("http://localhost:3000/orders", {
          method: "GET",
          credentials: "include",
        });
        if (response.status === 401) { navigate("/login"); return; }
        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || "Unable to load orders");
        setOrders(data?.data?.orders || []);
      } catch (err) {
        setError(err.message || "Unable to load orders");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [navigate]);

  if (loading) return <p className="orders-feedback">Loading orders...</p>;
  if (error) return <div className="orders-page"><div className="orders-feedback"><p>{error}</p></div></div>;

  if (!orders.length) {
    return (
      <section className="orders-page">
        <h1>Order History</h1>
        <div className="orders-empty">
          <p>You have no past orders yet.</p>
          <Link to="/products" className="orders-link">Start shopping</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="orders-page">
      <h1>Order History</h1>
      <p className="orders-intro">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
      <ul className="orders-list">
        {orders.map((order) => (
          <li key={order.id} className="order-card">
            <div className="order-card-info">
              <h3>Order #{order.id}</h3>
              <span className="order-status">{order.status}</span>
            </div>
            <div className="order-card-total">${Number(order.total).toFixed(2)}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default OrdersPage;