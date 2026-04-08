import express from "express";
import {
  confirmBookingPayment,
  createBooking,
  getMyBookings
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const router=express.Router();
router.post("/", protect, createBooking);
router.post("/confirm-payment", protect, confirmBookingPayment);
router.get("/mine", protect, getMyBookings);

export default router;
