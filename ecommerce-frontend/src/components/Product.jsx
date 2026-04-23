import { Link } from "react-router-dom";

function Product({ product }) {
  return (
    <li className="product-card">
      <Link to={`/products/${product.id}`}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">IMG</div>
        )}
      </Link>

      <div className="product-info">
        <Link to={`products/${product.id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-category">{product.category}</p>
      </div>

      <div className="product-footer">
        <span className="product-price">${Number(product.price).toFixed(2)}</span>
        <button className="product-add-btn">Add</button>
      </div>
    </li>
  );
}

export default Product;