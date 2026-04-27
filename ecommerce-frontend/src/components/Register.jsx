import { useState } from "react";
// Import the UseNavigate Hook for Logging in
import { useNavigate } from "react-router-dom";
import "../Register.css";

function RegisterPage() {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    // Add a loading state to track if the form is in flight to server
    const [loading, setLoading] = useState(false);
    // Add a server state to track errors coming back from server
    const [serverError, setServerError] = useState("");

    // Create a navigate instance
    const navigate = useNavigate();

    function validate(values) {
        const nextErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        const first = values.first_name.trim();
        const last = values.last_name.trim();
        const email = values.email.trim();

        if (!first) nextErrors.first_name = "First name is required.";
        else if (first.length > 50) nextErrors.first_name = "First name must be 50 characters or fewer.";

        if (!last) nextErrors.last_name = "Last name is required.";
        else if (last.length > 50) nextErrors.last_name = "Last name must be 50 characters or fewer.";

        if (!email) nextErrors.email = "Email is required.";
        else if (!emailRegex.test(email)) nextErrors.email = "Please enter a valid email address.";

        if (!values.password) nextErrors.password = "Password is required.";
        else if (!strongPasswordRegex.test(values.password)) {
            nextErrors.password = "Use 8+ chars with uppercase, lowercase, and a number.";
        }

        if (!values.confirmPassword) nextErrors.confirmPassword = "Please confirm your password.";
        else if (values.confirmPassword !== values.password) {
            nextErrors.confirmPassword = "Passwords do not match.";
        }

        return nextErrors;
    }

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Make onSubmit async for backend logic
    const onSubmit = async (e) => {
        e.preventDefault();

        // Set server error state to empty string
        setServerError("");

        // Validation of Data on UI
        const nextErrors = validate(form);
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) return;

        // Start Loading state
        setLoading(true);

        // Send Post Request 
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    first_name: form.first_name,
                    last_name: form.last_name,
                    email: form.email,
                    password: form.password
                }), 
                credentials: "include"
            });

            // Parse JSON Body
            const data = await response.json();

            // If server returned an error status
            if (!response.ok) {
                throw new Error("Registration failed. Please check your details and try again.")
            }

            // If successful registration
            navigate("/");

        } catch (err) {
            // Show Error in UI
            setServerError(err.message);
        } finally {
            // Turn Off Loading
            setLoading(false);
        }
    };

    return (
        <main className="register-shell">
            <section className="register-card">
                <aside className="register-left">
                    <h1 className="brand">HAUL</h1>
                    <h2>Start your haul.</h2>
                    <p>One account. Everything you need.</p>

                    <ul>
                        <li>Track all your orders in one place</li>
                        <li>Faster checkout every time</li>
                        <li>Personalized picks just for you</li>
                        <li>Easy returns and order history</li>
                    </ul>

                    <small>Free to join. No spam. No nonsense.</small>
                </aside>

                <section className="register-right">
                    <h2>Create your account</h2>
                    <p className="signin-text">
                        Already have an account? <a href="/login">Sign in</a>
                    </p>

                    <form onSubmit={onSubmit} className="register-form">
                        <div className="name-row">
                            <label>
                                First name
                                <input
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={onChange}
                                    placeholder="First name"
                                />
                                {errors.first_name && <span className='field-error'>{errors.first_name}</span>}
                            </label>

                            <label>
                                Last name
                                <input
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={onChange}
                                    placeholder="Last name"
                                />
                                {errors.last_name && <span className='field-error'>{errors.last_name}</span>}
                            </label>
                        </div>

                        <label>
                            Email address
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={onChange}
                                placeholder="you@email.com"
                            />
                            {errors.email && <span className='field-error'>{errors.email}</span>}
                        </label>

                        <label>
                            Password
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={onChange}
                                placeholder="Create a password"
                            />
                            {errors.password && <span className='field-error'>{errors.password}</span>}
                        </label>

                        <label>
                            Confirm password
                            <input
                                name="confirmPassword"
                                type="password"
                                value={form.confirmPassword}
                                onChange={onChange}
                                placeholder="Confirm your password"
                            />
                            {errors.confirmPassword && <span className='field-error'>{errors.confirmPassword}</span>}
                        </label>

                        {serverError && <div className="form-error">{serverError}</div>}

                        <button type="submit" className="create-btn" disabled={loading}>
                            {loading ? "Creating Account" : "Create Account"}
                        </button>
                    </form>
                </section>
            </section>
        </main>
    );
}

export default RegisterPage;