import express from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEventCalendar,
  getEvents,
  updateEvent
} from "../controllers/eventController.js";
import { authorize, protect } from "../middleware/auth.js";

const router=express.Router();
router.get("/", getEvents);
router.get("/calendar/month", getEventCalendar);
router.get("/:id", getEventById);
router.post("/", protect, authorize("admin"), createEvent);
router.put("/:id", protect, authorize("admin"), updateEvent);
router.delete("/:id", protect, authorize("admin"), deleteEvent);

export default router;
