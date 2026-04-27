import { useState, useEffect, useMemo } from 'react';
import ProductList from "./ProductList";
import './Products.css';

function ProductsPage({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products?limit=1000`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Unable to retrieve products (server error). Please try again.");
        }
        setProducts(data?.data?.products || []);
      } catch (err) {
        setServerError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = products.map((p) => p.category).filter(Boolean);
    return [...new Set(cats)].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !term || p.name.toLowerCase().includes(term);
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  if (loading) return <p>Loading Products</p>;
  if (serverError) return <p>{serverError}</p>;

  return (
    <div className="products-page">
      <h1>Products</h1>

      <div className="products-filters">
        <input
          className="products-search"
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="products-category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {(search || selectedCategory) && (
          <button
            className="products-clear-btn"
            onClick={() => { setSearch(""); setSelectedCategory(""); }}
          >
            Clear
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <p className="products-no-results">No products match your search.</p>
      ) : (
        <>
          <p className="products-count">{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}</p>
          <ProductList products={filteredProducts} user={user} />
        </>
      )}
    </div>
  );
}

export default ProductsPage;