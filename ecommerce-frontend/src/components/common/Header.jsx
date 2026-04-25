// Import Link from React Router DOM
import { Link, useNavigate } from "react-router-dom";

function Header({ user, setUser }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.log("Logout error:", error);
        } finally {
            setUser(null);
            navigate("/login");
        }
    };

    return (
        <header>
            <h1 className="brand">
                <Link to="/products">HAUL</Link>
            </h1>

            <nav>
                <ul>
                    <Link to="/products">Products</Link>
                    {!user && <Link to="/register">Register</Link>}
                    {!user && <Link to="/login">Login</Link>}
                    {user && <Link to="/cart">Cart</Link>}
                    {user && <Link to="/orders">Orders</Link>}
                    {user && <Link to="/profile">Profile</Link>}
                    {user && (
                        <div className="header-user">
                            <span className="header-greeting">Hi, {user.first_name}</span>
                            <button className="header-logout-btn" type="button" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;
