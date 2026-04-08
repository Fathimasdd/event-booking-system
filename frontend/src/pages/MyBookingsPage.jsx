import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import api from "../api/client";

const MyBookingsPage=() => {
  const [bookings, setBookings]=useState([]);
  const [notifications, setNotifications]=useState([]);

  const loadData=async () => {
    api.get("/bookings/mine").then(({ data }) => setBookings(data));
    api.get("/notifications/mine").then(({ data }) => setNotifications(data));
  };

  useEffect(() => {
    loadData();
    const interval=setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const markRead=async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
    );
  };

  return (
    <main className="container">
      <h2>My Bookings</h2>
      <section className="list">
        {bookings.map((booking) => (
          <div key={booking._id} className="list-item">
            <strong>{booking.event?.title}</strong>
            <span>{dayjs(booking.createdAt).format("DD MMM YYYY")}</span>
            <span>{booking.quantity} tickets | ${booking.totalPrice}</span>
            <span className={booking.paymentStatus === "paid" ? "paid" : "pending"}>
              {booking.paymentStatus}
            </span>
            {booking.paymentStatus === "pending" ? (
              <Link
                className="primary-btn"
                to={`/events/${booking.event?._id}?bookingId=${booking._id}`}
              >
                Complete Payment
              </Link>
            ) : null}
          </div>
        ))}
      </section>
      <h3>Notifications</h3>
      <button className="ghost-btn" onClick={loadData}>Refresh Notifications</button>
      <section className="list">
        {notifications.length === 0 ? (
          <div className="list-item">No notifications yet. Book an event to receive updates.</div>
        ) : notifications.map((notification) => (
          <div key={notification._id} className={`list-item ${notification.isRead ? "read-row" : ""}`}>
            <strong>
              {notification.title}
              {!notification.isRead ? " (new)" : ""}
            </strong>
            <span>{notification.message}</span>
            {!notification.isRead ? (
              <button className="ghost-btn" onClick={() => markRead(notification._id)}>
                Mark as read
              </button>
            ) : null}
          </div>
        ))}
      </section>
    </main>
  );
};

export default MyBookingsPage;
