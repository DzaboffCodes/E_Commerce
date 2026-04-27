import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Login.css";

function LoginPage({setUser}) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();

  function validate(values) {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = values.email.trim();

    if (!email) nextErrors.email = "Email is required.";
    else if (!emailRegex.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!values.password) nextErrors.password = "Password is required.";

    return nextErrors;
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please check your details and try again.");
      }
      
      setUser(data?.data?.user || null)
      navigate("/");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-card">
        <aside className="login-left">
          <h1 className="brand">HAUL</h1>
          <h2>Welcome back.</h2>
          <p>Sign in to pick up right where you left off.</p>
          <small>Free to join. No spam. No nonsense.</small>
        </aside>

        <section className="login-right">
          <h2>Sign in</h2>

          <form onSubmit={onSubmit} className="login-form">
            <label>
              Email address
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@email.com"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
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
              {errors.password && <span className="field-error">{errors.password}</span>}
            </label>

            {/* <div className="forgot-row">
              <Link to="/forgot-password">Forgot your password?</Link>
            </div> */}

            {serverError && <div className="form-error">{serverError}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="login-footer-link">
            New to HAUL? <Link to="/register">Create a free account</Link>
          </p>
        </section>
      </section>
    </main>
  );
}

export default LoginPage;