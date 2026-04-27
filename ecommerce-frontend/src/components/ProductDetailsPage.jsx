import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './ProductDetailsPage.css'

function ProductDetailsPage({ user }) {
    // Get id from parameters
    let { id } = useParams();

    const navigate = useNavigate();

    // States
    const [product, setProduct] = useState({});
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState("");
    const [adding, setAdding] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const [addedToCart, setAddedToCart] = useState(false);

    const handleAddClick = async () => {
        setCartMessage("");
        setAddedToCart(false);

        if (!user) {
            navigate('/login');
            return;
        }

        setAdding(true);
        setCartMessage("");

        try {
            let cartId = localStorage.getItem('activeCartId');

            // Create cart once (or reuse existing)
            if (!cartId) {
                const cartResponse = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
                    method: "POST",
                    credentials: "include"
                });

                const cartData = await cartResponse.json();
                if (!cartResponse.ok) {
                    throw new Error(cartData?.message || "Could not create cart");
                }

                cartId = cartData?.data?.cart?.id;
                localStorage.setItem("activeCartId", String(cartId))
            }

            const addResponse = await fetch(`${import.meta.env.VITE_API_URL}/cart/${cartId}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    productId: product.id,
                    qty: 1,
                }),
            });

            const addData = await addResponse.json();
            if (!addResponse.ok) {
                throw new Error(addData?.message || "Could not add item to cart");
            }

            setCartMessage("Added to cart")
            setAddedToCart(true);
        } catch (err) {
            setCartMessage(err.message);
            setAddedToCart(false);
        } finally {
            setAdding(false);
        }
    };

    // UseEffect to fetch specific product 
    useEffect(() => {
        const loadProduct = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`, {
                    method: "GET"
                })
                const data = await response.json();

                if (!response.ok) {
                    throw new Error('Unable to retrieve specific product. Please try again.')
                } else {
                    setProduct(data.data.product)
                }
            } catch (err) {
                setServerError(err.message)
            } finally {
                setLoading(false)
            }
        };
        loadProduct();
    }, [id]);

    if (loading) {
        return <p>Loading Products</p>
    }

    if (serverError) {
        return <p>{serverError}</p>
    }

    return (
        <div className="product-details-page">
            <div className="product-details-container">
                <div>
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="product-details-image"
                        />
                    ) : (
                        <div className="product-details-image-placeholder">IMG</div>
                    )}
                </div>

                <div className="product-details-info">
                    <div className="product-details-header">
                        <h1>{product.name}</h1>
                        <p className="product-details-category">{product.category}</p>
                    </div>

                    <p className="product-details-description">{product.description}</p>

                    <div>
                        <div className="product-details-price">
                            ${Number(product.price).toFixed(2)}
                        </div>
                        <p className="product-details-stock">
                            {product.stock_quantity > 0
                                ? `${product.stock_quantity} in stock`
                                : 'Out of stock'}
                        </p>
                    </div>

                    <div className="product-details-actions">
                        <button
                            className="product-add-to-cart-btn"
                            onClick={handleAddClick}
                            disabled={adding}
                        >
                            {adding ? "Adding..." : "Add to Cart"}
                        </button>

                        {addedToCart && (
                            <button
                                type="button"
                                className="product-go-to-cart-btn"
                                onClick={() => navigate("/cart")}
                            >
                                Go to Cart
                            </button>
                        )}
                    </div>

                    {cartMessage && <p className="product-cart-message">{cartMessage}</p>}
                </div>
            </div>
        </div>
    );
}

export default ProductDetailsPage;