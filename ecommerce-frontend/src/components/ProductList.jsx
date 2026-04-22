import Product from './Products';

function ProductList({ products }) {
    if (!products || products.length === 0) {
        return <p>No products found.</p>
    }

    return (
        <>
            <ul>
                {products.map((product) => {
                    <Product key={product.id} product={product} />
                })}
            </ul>
        </>
    )
}

export default ProductList;