import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar=() => {
  const { user, logout }=useAuth();
  return (
    <header className="navbar">
      <Link to="/" className="logo">EventBookingSystem</Link>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/calendar">Calendar</Link>
        {user && <Link to="/bookings">My Bookings</Link>}
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        {user ? (
          <button className="ghost-btn" onClick={logout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
