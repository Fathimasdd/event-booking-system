import Event from "../models/Event.js";

export const getEvents=async (req, res) => {
  try {
    const { city, category, date }=req.query;
    const query={ isPublished: true };

    if (city) query.city=new RegExp(city, "i");
    if (category) query.category=new RegExp(category, "i");
    if (date) {
      const start=new Date(date);
      const end=new Date(date);
      end.setDate(end.getDate() + 1);
      query.startDateTime={ $gte: start, $lt: end };
    }

    const events=await Event.find(query).sort({ startDateTime: 1 });
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getEventById=async (req, res) => {
  const event=await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  return res.json(event);
};

export const createEvent=async (req, res) => {
  try {
    const event=await Event.create({
      ...req.body,
      availableSeats: req.body.totalSeats,
      createdBy: req.user._id
    });
    return res.status(201).json(event);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateEvent=async (req, res) => {
  try {
    const event=await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const bookedSeats=event.totalSeats - event.availableSeats;
    Object.assign(event, req.body);
    if (req.body.totalSeats && req.body.totalSeats < bookedSeats) {
      return res.status(400).json({ message: "Total seats below already booked seats" });
    }
    event.availableSeats=event.totalSeats - bookedSeats;
    await event.save();
    return res.json(event);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteEvent=async (req, res) => {
  const event=await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  await event.deleteOne();
  return res.json({ message: "Event deleted" });
};

export const getEventCalendar=async (req, res) => {
  const month=Number(req.query.month);
  const year=Number(req.query.year);
  const start=new Date(year, month - 1, 1);
  const end=new Date(year, month, 1);

  const events=await Event.find({
    startDateTime: { $gte: start, $lt: end },
    isPublished: true
  }).select("title startDateTime availableSeats city");

  return res.json(events);
};
