// Route level page component for Products Page
import { useState, useEffect } from 'react';

function ProductsPage() {
  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/products', {
          method: "GET",
        })
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Include to retrieve products (server error). Please try again.")
        } else {
          setProducts(data?.data?.products || [])
        }
      } catch (err) {
        setServerError(err.message)
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) {
    return <p>Loading Products</p>
  }

  if (serverError) {
    return <p>{serverError}</p>
  }

  if (products.length === 0) {
    return <p>No products found.</p>
  }

  return (
    <>
      <h1>Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <p>Stock: {product.stock_quantity}</p>
            <p>Category: {product.category}</p>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} width="180" />
            ) : (
              <p>No image available</p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default ProductsPage;