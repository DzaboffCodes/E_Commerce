import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

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
        <div>
            <img
                src={product.image_url}
                alt={product.name}
            >
            </img>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p>{product.category}</p>
            <span>${Number(product.price).toFixed(2)}</span>

            <div>
                <button>Add to Cart</button>
            </div>
        </div>
    )
}

export default ProductDetailsPage;