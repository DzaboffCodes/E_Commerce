import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CartPage.css";

function CartPage() {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState("0.00");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingItemId, setRemovingItemId] = useState(null);
    const [updatingItemId, setUpdatingItemId] = useState(null);


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

            const response = await fetch(`${import.meta.env.VITE_API_URL}/cart/${cartId}`, {
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

    useEffect(() => {
        loadCart();
    }, [navigate]);

    const handleRemove = async (itemId) => {
        const cartId = localStorage.getItem("activeCartId");

        if (!cartId) return;

        setRemovingItemId(itemId);
        setError("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/cart/${cartId}/items/${itemId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (response.status === 401) {
                navigate("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Unable to remove item");
            }

            await loadCart();
        } catch (err) {
            setError(err.message || "Unable to remove item");
        } finally {
            setRemovingItemId(null);
        }
    };

    const handleIncrease = async (item) => {
        const cartId = localStorage.getItem("activeCartId");
        if (!cartId) return;

        setUpdatingItemId(item.cart_item_id);
        setError("");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/cart/${cartId}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    productId: item.product_id,
                    qty: 1,
                }),
            });

            if (response.status === 401) {
                navigate("/login");
                return;
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data?.message || "Unable to increase quantity");

            await loadCart();
        } catch (err) {
            setError(err.message || "Unable to increase quantity");
        } finally {
            setUpdatingItemId(null);
        }
    };

    const handleDecrease = async (item) => {
        const cartId = localStorage.getItem("activeCartId");
        if (!cartId) return;

        setUpdatingItemId(item.cart_item_id);
        setError("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/cart/${cartId}/items/${item.cart_item_id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (response.status === 401) {
                navigate("/login");
                return;
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data?.message || "Unable to decrease quantity");

            await loadCart();
        } catch (err) {
            setError(err.message || "Unable to decrease quantity");
        } finally {
            setUpdatingItemId(null);
        }
    };

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
                <p className="cart-page-intro">
                    Everything you want to buy will show up here.
                </p>

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
                                    <div className="cart-qty-control">
                                        <button
                                            type="button"
                                            className="cart-qty-btn"
                                            onClick={() => handleDecrease(item)}
                                            disabled={updatingItemId === item.cart_item_id}
                                        >
                                            -
                                        </button>

                                        <span className="cart-meta-chip">Qty: {item.qty}</span>

                                        <button
                                            type="button"
                                            className="cart-qty-btn"
                                            onClick={() => handleIncrease(item)}
                                            disabled={updatingItemId === item.cart_item_id}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <span className="cart-meta-chip">Price: ${Number(item.price).toFixed(2)}</span>
                                </div>

                                <div className="cart-subtotal">
                                    <p className="cart-subtotal-label">Subtotal</p>
                                    <p className="cart-subtotal-value">
                                        ${Number(item.subtotal).toFixed(2)}
                                    </p>

                                    <button
                                        type="button"
                                        className="cart-remove-btn"
                                        onClick={() => handleRemove(item.cart_item_id)}
                                        disabled={removingItemId === item.cart_item_id}
                                    >
                                        {removingItemId === item.cart_item_id ? "Removing..." : "Remove"}
                                    </button>
                                </div>
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
                        <button
                            type="button"
                            className="cart-btn cart-btn-primary"
                            onClick={() => navigate("/checkout")}
                        >
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