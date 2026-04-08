import cron from "node-cron";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";

export const startReminderJob=() => {
  cron.schedule("*/1 * * * *", async () => {
    try {
      const now=new Date();
      const reminderWindow=new Date(now);
      reminderWindow.setDate(reminderWindow.getDate() + 3);

      const bookings=await Booking.find({ paymentStatus: "paid" }).populate("event");
      const upcoming=bookings.filter((booking) => {
        if (!booking.event?.startDateTime) return false;
        const start=new Date(booking.event.startDateTime);
        return start > now && start < reminderWindow;
      });

      for (const booking of upcoming) {
        const existing=await Notification.findOne({
          booking: booking._id,
          title: "Event Reminder"
        });
        if (existing) continue;
        await Notification.create({
          user: booking.user,
          booking: booking._id,
          title: "Event Reminder",
          message: `Reminder: ${booking.event.title} is coming up soon.`
        });
      }
    } catch (error) {
      console.error("Reminder job failed:", error.message);
    }
  });
};
