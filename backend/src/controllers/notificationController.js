import Notification from "../models/Notification.js";

export const getMyNotifications=async (req, res) => {
  const notifications=await Notification.find({ user: req.user._id }).sort({
    createdAt: -1
  });
  return res.json(notifications);
};

export const markNotificationRead=async (req, res) => {
  const notification=await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  if (String(notification.user) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  notification.isRead=true;
  await notification.save();
  return res.json(notification);
};
