import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import EventCard from "../components/EventCard";

const categoryOptions=[
  "",
  "Music",
  "Nightlife",
  "Theatre",
  "Comedy",
  "Conference",
  "Business",
  "Sports",
  "Food & Drink"
];

const cityOptions=[
  "",
  "Hyderabad",
  "Bengaluru",
  "Mumbai",
  "Chennai",
  "Delhi",
  "Pune",
  "Kolkata",
  "Vijayawada"
];

const EventsPage=() => {
  const [searchParams, setSearchParams]=useSearchParams();
  const [events, setEvents]=useState([]);
  const [filters, setFilters]=useState({
    city: searchParams.get("city") || "",
    category: searchParams.get("category") || ""
  });

  const normalizedFilters=useMemo(
    () => ({
      city: filters.city || undefined,
      category: filters.category || undefined
    }),
    [filters]
  );

  const loadEvents=async (params=normalizedFilters) => {
    const { data }=await api.get("/events", { params });
    setEvents(data);
  };

  const applyFilters=() => {
    const next={};
    if (filters.city) next.city=filters.city;
    if (filters.category) next.category=filters.category;
    setSearchParams(next);
    loadEvents({
      city: next.city,
      category: next.category
    });
  };

  const clearFilters=() => {
    const reset={ city: "", category: "" };
    setFilters(reset);
    setSearchParams({});
    loadEvents({ city: undefined, category: undefined });
  };

  useEffect(() => {
    const nextFilters={
      city: searchParams.get("city") || "",
      category: searchParams.get("category") || ""
    };
    setFilters(nextFilters);
    loadEvents({
      city: nextFilters.city || undefined,
      category: nextFilters.category || undefined
    });
  }, [searchParams]);

  return (
    <main className="container">
      <h2>Browse Events</h2>
      <div className="filter-row">
        <select
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        >
          {cityOptions.map((city) => (
            <option key={city || "all-cities"} value={city}>
              {city || "All Cities"}
            </option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          {categoryOptions.map((category) => (
            <option key={category || "all-categories"} value={category}>
              {category || "All Categories"}
            </option>
          ))}
        </select>
        <button className="primary-btn" onClick={applyFilters}>Search</button>
        <button className="ghost-btn" onClick={clearFilters}>Clear</button>
      </div>
      <section className="events-grid">
        {events.map((event) => <EventCard key={event._id} event={event} />)}
      </section>
    </main>
  );
};

export default EventsPage;
