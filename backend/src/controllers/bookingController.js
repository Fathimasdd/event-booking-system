import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import Notification from "../models/Notification.js";

export const createBooking=async (req, res) => {
  try {
    const { eventId, quantity, paymentMethod }=req.body;
    const event=await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.availableSeats < quantity) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    event.availableSeats -= quantity;
    await event.save();

    const booking=await Booking.create({
      user: req.user._id,
      event: event._id,
      quantity,
      totalPrice: quantity * event.price,
      paymentMethod,
      paymentStatus: "pending"
    });

    await Notification.create({
      user: req.user._id,
      booking: booking._id,
      title: "Booking Created",
      message: `Booking created for ${event.title}. Complete payment to confirm your tickets.`
    });

    return res.status(201).json(booking);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const confirmBookingPayment=async (req, res) => {
  const { bookingId, paymentRef }=req.body;
  const booking=await Booking.findById(bookingId).populate("event");
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (String(booking.user) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  booking.paymentStatus="paid";
  booking.paymentRef=paymentRef;
  await booking.save();

  await Notification.create({
    user: req.user._id,
    booking: booking._id,
    title: "Booking Confirmed",
    message: `Your booking for ${booking.event.title} is confirmed.`
  });

  return res.json(booking);
};

export const getMyBookings=async (req, res) => {
  const bookings=await Booking.find({ user: req.user._id })
    .populate("event")
    .sort({ createdAt: -1 });
  return res.json(bookings);
};
