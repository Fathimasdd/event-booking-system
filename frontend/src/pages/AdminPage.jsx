import { useEffect, useState } from "react";
import api from "../api/client";

const empty={
  title: "",
  description: "",
  category: "",
  venue: "",
  city: "",
  imageUrl: "",
  startDateTime: "",
  endDateTime: "",
  price: 0,
  totalSeats: 1
};

const AdminPage=() => {
  const [events, setEvents]=useState([]);
  const [form, setForm]=useState(empty);
  const [editId, setEditId]=useState("");

  const load=async () => {
    const { data }=await api.get("/events");
    setEvents(data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit=async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/events/${editId}`, form);
    else await api.post("/events", form);
    setForm(empty);
    setEditId("");
    load();
  };

  const onEdit=(event) => {
    setEditId(event._id);
    setForm({ ...event, startDateTime: event.startDateTime?.slice(0, 16), endDateTime: event.endDateTime?.slice(0, 16) });
  };

  const onDelete=async (id) => {
    await api.delete(`/events/${id}`);
    load();
  };

  return (
    <main className="container">
      <h2>Admin Event Management</h2>
      <form onSubmit={submit} className="admin-form">
        {Object.keys(empty).map((key) => (
          <input
            key={key}
            type={key.includes("DateTime") ? "datetime-local" : key === "price" || key === "totalSeats" ? "number" : "text"}
            placeholder={key}
            value={form[key] ?? ""}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            required={["title", "description", "category", "venue", "city", "startDateTime", "endDateTime"].includes(key)}
          />
        ))}
        <button className="primary-btn" type="submit">{editId ? "Update Event" : "Create Event"}</button>
      </form>
      <section className="list">
        {events.map((event) => (
          <div key={event._id} className="list-item">
            <strong>{event.title}</strong>
            <span>${event.price} | seats: {event.availableSeats}/{event.totalSeats}</span>
            <div>
              <button className="ghost-btn" onClick={() => onEdit(event)}>Edit</button>
              <button className="danger-btn" onClick={() => onDelete(event._id)}>Delete</button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

export default AdminPage;
