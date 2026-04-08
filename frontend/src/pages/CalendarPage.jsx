import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

const CalendarPage=() => {
  const [month, setMonth]=useState(dayjs().month() + 1);
  const [year, setYear]=useState(dayjs().year());
  const [events, setEvents]=useState([]);

  useEffect(() => {
    api
      .get("/events/calendar/month", { params: { month, year } })
      .then(({ data }) => setEvents(data));
  }, [month, year]);

  const grouped=useMemo(() => {
    const map=new Map();
    events.forEach((event) => {
      const day=dayjs(event.startDateTime).date();
      if (!map.has(day)) map.set(day, []);
      map.get(day).push(event);
    });
    return map;
  }, [events]);

  const daysInMonth=dayjs(`${year}-${String(month).padStart(2, "0")}-01`).daysInMonth();
  const days=Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <main className="container">
      <h2>Event Calendar</h2>
      <div className="calendar-controls">
        <button className="ghost-btn" onClick={() => setMonth((m) => (m === 1 ? 12 : m - 1))}>Prev</button>
        <strong>{dayjs(`${year}-${month}-01`).format("MMMM YYYY")}</strong>
        <button className="ghost-btn" onClick={() => setMonth((m) => (m === 12 ? 1 : m + 1))}>Next</button>
      </div>
      <section className="calendar-grid">
        {days.map((day) => (
          <article key={day} className="calendar-cell">
            <h4>{day}</h4>
            {(grouped.get(day) || []).map((event) => (
              <p key={event._id} className="calendar-event">{event.title}</p>
            ))}
          </article>
        ))}
      </section>
    </main>
  );
};

export default CalendarPage;
