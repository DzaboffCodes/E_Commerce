// Route level page component for Products Page
import { useState, useEffect } from 'react';
import ProductList from "./ProductList";
import './Products.css';

function ProductsPage({ user }) {
  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/products?limit=1000', {
          method: "GET",
        })
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Unable to retrieve products (server error). Please try again.")
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

  return (
    <div className="products-page">
      <h1>Products</h1>
      <ProductList products={products} user={user}/>
    </div>
  );
};

export default ProductsPage;