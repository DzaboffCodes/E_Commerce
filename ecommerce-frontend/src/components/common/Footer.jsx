// Import Link from React Router DOM
import {Link} from "react-router-dom";

// Footer component is a persisent layout component
function Footer() {
    return (
        <footer>
            <h3>Haul</h3>
            <p>Your everyday marketplace</p>
            <p>© {new Date().getFullYear()} Haul. All rights reserved.</p>
            
            {/* Nav has a placeholder for right now */}
            <nav>
                <Link to="/products">Products</Link>
                {/* Link to Orders, Contact, Privacy, Terms, etc. */}
            </nav>
        </footer>
    )
}

export default Footer;