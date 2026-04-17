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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
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
              </label>

              <label>
                Last name
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={onChange}
                  placeholder="Last name"
                />
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