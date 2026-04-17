// Import Link from React Router DOM
import {Link} from "react-router-dom";

// Header component is a persisent layout component
function Header() {
    return (
        <header>
            <h1 className='brand'>HAUL</h1>
            
            {/* Link changes URL without full page refresh */}
            <nav>
                <ul>
                    <Link to="/">Home</Link> 
                    <Link to="/products">Products</Link>
                    <Link to='/register'>Register</Link>
                </ul>
            </nav>
        </header>
    )
}

export default Header;
