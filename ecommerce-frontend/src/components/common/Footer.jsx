import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <span className="footer-logo">HAUL</span>
                    <p className="footer-tagline">Your everyday marketplace</p>
                </div>

                <nav className="footer-nav">
                    <Link to="/products">Products</Link>
                    <Link to="/cart">Cart</Link>
                    <Link to="/orders">Orders</Link>
                </nav>

                <p className="footer-copy">© {new Date().getFullYear()} Haul. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;