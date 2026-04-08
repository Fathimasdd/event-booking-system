import express from "express";
import {
  capturePaypalOrder,
  createPaypalOrder,
  createStripeIntent,
  paypalWebhook,
  stripeWebhook
} from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const router=express.Router();
router.post("/webhooks/stripe", stripeWebhook);
router.post("/webhooks/paypal", express.json(), paypalWebhook);
router.post("/stripe/intent", protect, createStripeIntent);
router.post("/paypal/order", protect, createPaypalOrder);
router.post("/paypal/capture", protect, capturePaypalOrder);

export default router;
