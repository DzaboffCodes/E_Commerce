import { useState, useEffect, useMemo } from 'react';
import ProductList from "./ProductList";
import './Products.css';

const PAGE_SIZE = 24;

function ProductsPage({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false
  });

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setServerError("");
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(PAGE_SIZE)
        });

        if (selectedCategory) params.set("category", selectedCategory);
        if (search.trim()) params.set("search", search.trim());

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/products?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error("Unable to retrieve products (server error). Please try again.");
        }

        setProducts(data?.data?.products || []);
        setPagination(
          data?.data?.pagination || {
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 1,
            hasPrev: false,
            hasNext: false
          }
        );
      } catch (err) {
        setServerError(err.message || "Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, selectedCategory, search]);

  const categories = useMemo(() => {
    return [
      "beauty",
      "fragrances",
      "furniture",
      "groceries",
      "home-decoration",
      "kitchen-accessories",
      "laptops",
      "mens-shirts",
      "mens-shoes",
      "mens-watches",
      "mobile-accessories"
    ];
  }, []);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const onCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

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
          onChange={onSearchChange}
        />
        <select
          className="products-category-select"
          value={selectedCategory}
          onChange={onCategoryChange}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {(search || selectedCategory) && (
          <button className="products-clear-btn" onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <p className="products-no-results">No products match your search.</p>
      ) : (
        <>
          <p className="products-count">
            Showing {products.length} of {pagination.total} products
          </p>
          <ProductList products={products} user={user} />
        </>
      )}

      <div className="products-pagination">
        <button
          className="products-page-btn"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={!pagination.hasPrev}
        >
          Previous
        </button>

        <span className="products-page-label">
          Page {pagination.page} of {pagination.totalPages}
        </span>

        <button
          className="products-page-btn"
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={!pagination.hasNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ProductsPage;