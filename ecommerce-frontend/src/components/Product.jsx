function Product({ product }) {
  return (
    <li>
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
  );
}

export default Product;