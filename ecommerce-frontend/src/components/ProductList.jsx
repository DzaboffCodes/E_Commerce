import Product from './Product';

function ProductList({ products }) {
    if (!products || products.length === 0) {
        return <p>No products found.</p>;
    }

    return (
        <ul className="product-grid">
            {products.map((product) => (
                <Product key={product.id} product={product} />
            ))}
        </ul>
    );
}

export default ProductList;