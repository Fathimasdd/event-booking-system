import Stripe from "stripe";
import paypal from "@paypal/checkout-server-sdk";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";

const hasRealStripeKey=
  !!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("dummy");
const stripe=hasRealStripeKey ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const hasRealPaypalKeys=
  !!process.env.PAYPAL_CLIENT_ID &&
  !!process.env.PAYPAL_CLIENT_SECRET &&
  process.env.PAYPAL_CLIENT_ID !== "dummy" &&
  process.env.PAYPAL_CLIENT_SECRET !== "dummy";

const paypalEnvironment=
  process.env.PAYPAL_MODE === "live"
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );

const paypalClient=new paypal.core.PayPalHttpClient(paypalEnvironment);

const markBookingPaid=async (bookingId, paymentRef) => {
  const booking=await Booking.findById(bookingId).populate("event");
  if (!booking) return null;
  if (booking.paymentStatus !== "paid") {
    booking.paymentStatus="paid";
    booking.paymentRef=paymentRef;
    await booking.save();
  }

  const existingNotification=await Notification.findOne({
    booking: booking._id,
    title: "Booking Confirmed"
  });
  if (!existingNotification) {
    await Notification.create({
      user: booking.user,
      booking: booking._id,
      title: "Booking Confirmed",
      message: `Your booking for ${booking.event?.title || "event"} is confirmed.`
    });
  }
  return booking;
};

export const createStripeIntent=async (req, res) => {
  try {
    const { bookingId }=req.body;
    const booking=await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (!hasRealStripeKey) {
      return res.json({
        clientSecret: `mock_client_secret_${booking.id}`,
        paymentIntentId: `mock_pi_${booking.id}`,
        isMock: true
      });
    }

    const intent=await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100),
      currency: "usd",
      metadata: { bookingId: booking.id }
    });

    return res.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      isMock: false
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const createPaypalOrder=async (req, res) => {
  try {
    const { bookingId }=req.body;
    const booking=await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (!hasRealPaypalKeys) {
      return res.json({ orderId: `mock_order_${booking.id}`, isMock: true });
    }

    const request=new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: booking.totalPrice.toFixed(2) },
          custom_id: booking.id
        }
      ]
    });
    const order=await paypalClient.execute(request);
    return res.json({ orderId: order.result.id, isMock: false });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const capturePaypalOrder=async (req, res) => {
  try {
    const { orderId }=req.body;
    if (!hasRealPaypalKeys || String(orderId).startsWith("mock_order_")) {
      return res.json({ id: orderId, status: "COMPLETED", isMock: true });
    }
    const request=new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const capture=await paypalClient.execute(request);
    const purchaseUnit=capture.result.purchase_units?.[0];
    const bookingId=purchaseUnit?.custom_id;
    if (bookingId) {
      await markBookingPaid(bookingId, capture.result.id);
    }
    return res.json({
      id: capture.result.id,
      status: capture.result.status
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const stripeWebhook=async (req, res) => {
  try {
    if (!hasRealStripeKey || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(200).json({ received: true, skipped: true });
    }
    const signature=req.headers["stripe-signature"];
    if (!signature) return res.status(400).send("Missing stripe signature");

    const event=stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "payment_intent.succeeded") {
      const intent=event.data.object;
      const bookingId=intent.metadata?.bookingId;
      if (bookingId) await markBookingPaid(bookingId, intent.id);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

export const paypalWebhook=async (req, res) => {
  try {
    // In production, verify PayPal signature using PAYPAL_WEBHOOK_ID + verification API.
    const eventType=req.body?.event_type;
    if (eventType === "CHECKOUT.ORDER.APPROVED" || eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const resource=req.body.resource || {};
      const bookingId=
        resource.purchase_units?.[0]?.custom_id || resource.supplementary_data?.related_ids?.order_id;
      const paymentRef=resource.id || resource.supplementary_data?.related_ids?.capture_id;
      if (bookingId && paymentRef) {
        await markBookingPaid(bookingId, paymentRef);
      }
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
