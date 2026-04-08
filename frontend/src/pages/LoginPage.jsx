import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage=() => {
  const { login }=useAuth();
  const navigate=useNavigate();
  const [form, setForm]=useState({ email: "", password: "" });
  const [showPassword, setShowPassword]=useState(false);
  const [errorMessage, setErrorMessage]=useState("");

  const submit=async (e) => {
    e.preventDefault();
    try {
      setErrorMessage("");
      await login(form);
      navigate("/");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-brand">EventBookingSystem</p>
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Login to book concerts, conferences, and live events.</p>
        <form onSubmit={submit}>
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
          {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
          <button className="primary-btn auth-submit-btn" type="submit">Continue</button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
