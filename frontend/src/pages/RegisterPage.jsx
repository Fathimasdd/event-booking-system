import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage=() => {
  const { register }=useAuth();
  const navigate=useNavigate();
  const [form, setForm]=useState({ name: "", email: "", password: "", role: "user" });
  const [showPassword, setShowPassword]=useState(false);
  const [errorMessage, setErrorMessage]=useState("");

  const submit=async (e) => {
    e.preventDefault();
    try {
      setErrorMessage("");
      await register(form);
      navigate("/");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-brand">EventBookingSystem</p>
        <h2>Create your account</h2>
        <p className="auth-subtitle">Join now and start booking your favorite events.</p>
        <form onSubmit={submit}>
          <input placeholder="Name" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="password-field">
            <input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
          <button className="primary-btn auth-submit-btn" type="submit">Create Account</button>
        </form>
        <p className="auth-switch">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
