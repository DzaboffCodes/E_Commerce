import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

function ProfilePage({ user, setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }

    const loadProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3000/users/${user.id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load profile");
        const { first_name, last_name, email } = data.data.user;
        setForm({ first_name, last_name, email });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update profile");
      setUser((prev) => ({ ...prev, ...data.data.user }));
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="profile-feedback">Loading profile...</p>;

  return (
    <section className="profile-page">
      <h1>My Profile</h1>
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-field">
          <label htmlFor="first_name">First Name</label>
          <input id="first_name" name="first_name" type="text" value={form.first_name} onChange={handleChange} required />
        </div>
        <div className="profile-field">
          <label htmlFor="last_name">Last Name</label>
          <input id="last_name" name="last_name" type="text" value={form.last_name} onChange={handleChange} required />
        </div>
        <div className="profile-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        {error && <p className="profile-error">{error}</p>}
        {success && <p className="profile-success">{success}</p>}
        <button className="profile-save-btn" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}

export default ProfilePage;