import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./OrdersPage.css";

const CANCELLABLE = ["pending", "processing"];

function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [itemsCache, setItemsCache] = useState({});
  const [itemsLoading, setItemsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("http://localhost:3000/orders", {
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

  const handleToggle = async (orderId) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    if (itemsCache[orderId]) return;

    setItemsLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/orders/${orderId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setItemsCache((prev) => ({ ...prev, [orderId]: data?.data?.order?.items || [] }));
      }
    } finally {
      setItemsLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    setCancellingId(orderId);
    try {
      const res = await fetch(`http://localhost:3000/orders/${orderId}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => o.id === orderId ? { ...o, status: "cancelled" } : o)
        );
      }
    } finally {
      setCancellingId(null);
    }
  };

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
        {orders.map((order) => {
          const isOpen = expandedId === order.id;
          const items = itemsCache[order.id];
          return (
            <li key={order.id} className="order-card">
              <button className="order-card-header" onClick={() => handleToggle(order.id)}>
                <div className="order-card-info">
                  <h3>Order #{order.id}</h3>
                  <span className={`order-status order-status--${order.status}`}>
                    {order.status === "successful" ? "Order has been successfully placed" : order.status}
                  </span>
                </div>
                <div className="order-card-right">
                  <div className="order-card-total">${Number(order.total).toFixed(2)}</div>
                  <span className="order-chevron">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {isOpen && (
                <div className="order-items">
                  {itemsLoading && !items ? (
                    <p className="order-items-loading">Loading items...</p>
                  ) : items?.length ? (
                    <>
                      <ul className="order-items-list">
                        {items.map((item) => (
                          <li key={item.id} className="order-item-row">
                            <span className="order-item-name">{item.name}</span>
                            <span className="order-item-meta">
                              {item.qty} × ${Number(item.price).toFixed(2)}
                            </span>
                            <span className="order-item-subtotal">
                              ${(item.qty * item.price).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {CANCELLABLE.includes(order.status) && (
                        <button
                          className="order-cancel-btn"
                          onClick={() => handleCancel(order.id)}
                          disabled={cancellingId === order.id}
                        >
                          {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
                        </button>
                      )}

                      {order.status === "pending" && (
                        <button
                          className="order-pay-btn"
                          onClick={() => navigate(`/orders/${order.id}/pay`)}
                        >
                          Pay Now
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="order-items-loading">No items found.</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default OrdersPage;