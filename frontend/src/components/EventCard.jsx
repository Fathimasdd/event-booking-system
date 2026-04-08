import { Link } from "react-router-dom";
import dayjs from "dayjs";

const EventCard=({ event }) => (
  <article className="event-card">
    <img
      src={event.imageUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop"}
      alt={event.title}
    />
    <div className="event-card-body">
      <p className="event-meta">{dayjs(event.startDateTime).format("DD MMM YYYY, hh:mm A")} | {event.city}</p>
      <h3>{event.title}</h3>
      <p className="event-meta">{event.category} | {event.availableSeats} seats left</p>
      <p className="event-price">${event.price}</p>
      <Link to={`/events/${event._id}`} className="primary-btn">View & Book</Link>
    </div>
  </article>
);

export default EventCard;
