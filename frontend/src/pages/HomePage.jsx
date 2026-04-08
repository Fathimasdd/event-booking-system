import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/client";
import EventCard from "../components/EventCard";

const categories=[
  { label: "Music", icon: "🎤", query: "Music" },
  { label: "Nightlife", icon: "🌐", query: "Nightlife" },
  { label: "Performing & Visual Arts", icon: "🎭", query: "Theatre" },
  { label: "Holidays", icon: "🗓️", query: "Comedy" },
  { label: "Dating", icon: "💟", query: "Nightlife" },
  { label: "Hobbies", icon: "🎮", query: "Sports" },
  { label: "Business", icon: "🧾", query: "Business" },
  { label: "Food & Drink", icon: "🍹", query: "Food & Drink" }
];

const HomePage=() => {
  const [featured, setFeatured]=useState([]);

  useEffect(() => {
    api.get("/events").then(({ data }) => setFeatured(data.slice(0, 4)));
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <div className="hero-content">
          <p className="badge">GET INTO IT</p>
          <h1>From Pop Ballads to Tech Conferences</h1>
          <p>Discover concerts, conferences, sports, and more. Book securely with Stripe or PayPal.</p>
          <div className="hero-actions">
            <Link to="/events" className="primary-btn">Find Events</Link>
            <Link to="/calendar" className="ghost-btn">Open Calendar</Link>
          </div>
        </div>
        <img className="hero-artist-image" src="/homepage-artist.png" alt="Featured artist" />
      </section>

      <section>
        <h2>Discover by Category</h2>
        <div className="category-row">
          {categories.map((category) => (
            <Link
              key={category.label}
              to={`/events?category=${encodeURIComponent(category.query)}`}
              className="category-item"
            >
              <div className="category-icon">{category.icon}</div>
              <span>{category.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2>Featured Events</h2>
        <div className="events-grid">
          {featured.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
