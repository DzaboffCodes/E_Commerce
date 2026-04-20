// Import Link from React Router DOM
import { Link, useNavigate } from "react-router-dom";

// Header component is a persisent layout component
function Header({ user, setUser }) {

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/auth/logout", {
                method: "POST",
                credentials: "include",
            })
        } catch (error) {
            console.log("Logout error:", error)
        } finally {
            setUser(null);
            navigate('/login');
        }
};

    return (
        <header>
            <h1 className='brand'>HAUL</h1>

            {/* Link changes URL without full page refresh */}
            <nav>
                <ul>
                    <Link to="/">Home</Link>
                    <Link to="/products">Products</Link>

                    {!user && <Link to='/register'>Register</Link>}
                    {!user && <Link to='/login'>Login</Link>}

                    {user && <span>Hi, {user.first_name}</span>}
                    {user && (
                        <button type="button" onClick={handleLogout}>Logout</button>
                    )}
                </ul>
            </nav>
        </header>
    )
}

export default Header;
