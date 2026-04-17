import { useState } from "react";
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

  const onSubmit = (e) => {
    e.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    console.log("Register form:", form);
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

          <div className="social-row">
            <button type="button" className="social-btn">
              Continue with Google
            </button>
            <button type="button" className="social-btn">
              Continue with Facebook
            </button>
          </div>

          <div className="divider">or sign up with email</div>

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

            <button type="submit" className="create-btn">
              Create Account
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

export default RegisterPage;