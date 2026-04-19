import { useState } from "react";
// Import the UseNavigate Hook for Logging in
import { useNavigate } from "react-router-dom";
import "../Login.css";

function LoginPage() {
    // UseStates 
    // Form State
    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    // Add an error state to display errors
    const [errors, setErrors] = useState({});
    // Add a loading state to track if the form is in flight to server
    const [loading, setLoading] = useState(false);
    // Add a server state to track errors coming back from server
    const [serverError, setServerError] = useState("");

    // Create a navigate instance
    const navigate = useNavigate();

    // UI Validation Rules
    function validate(values) {
        const nextErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const email = values.email.trim();

        if (!email) nextErrors.email = "Email is required.";
        else if (!emailRegex.test(email)) nextErrors.email = "Please enter a valid email address.";

        if (!values.password) nextErrors.password = "Password is required.";

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
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password
                })
            });

            // Parse JSON Body
            const data = await response.json();

            // If server returned an error status
            if (!response.ok) {
                throw new Error("Login failed. Please check your detials and try again.")
            }

            // If successful
            navigate("/");

        } catch (err) {
            setServerError(err.message)
        } finally {
            setLoading(false);
        }
    }

return (
    <main>
        <section>
            <aside>
                <h1>HAUL</h1>
                <h2> Welcome Back</h2>
                <p>Sign in to pick up where you left off.</p>

                <small>Free to join. No spam. No nonsense</small>
            </aside>

            <section>
                <h2>Sign In</h2>
                <p>
                    Dont have an account? <a href="/register"> Create one</a>
                </p>

                <form onSubmit={onSubmit}>
                    <label>
                        Email
                        <input 
                            name="email"
                            value={form.email}
                            onChange={onChange}
                            placeholder="Email"
                        />
                        {errors.email && <span>{errors.email}</span>}
                    </label>

                    <label>
                        Password
                        <input 
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={onChange}
                            placeholder="Enter your password"
                        />
                        {errors.password && <span>{errors.password}</span>}
                    </label>

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging In" : "Login"}
                    </button>
                </form>
            </section>
        </section>
    </main>
)

}

export default LoginPage;