import Product from './Product';

function ProductList({ products, user}) {
    if (!products || products.length === 0) {
        return <p>No products found.</p>;
    }

    return (
        <ul className="product-grid">
            {products.map((product) => (
                <Product key={product.id} product={product} user={user}/>
            ))}
        </ul>
    );
}

export default ProductList;