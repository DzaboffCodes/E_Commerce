import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './ProductDetailsPage.css'

function ProductDetailsPage() {
    // Get id from parameters
    let { id } = useParams();

    // States
    const [product, setProduct] = useState({});
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState("");

    // UseEffect to fetch specific product 
    useEffect(() => {
        const loadProduct = async () => {
            try {
                const response = await fetch(`http://localhost:3000/products/${id}`, {
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
                        <button className="product-add-to-cart-btn">Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailsPage;