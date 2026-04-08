import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import api from "../api/client";
import StripeCheckoutForm from "../components/StripeCheckoutForm";
import PaypalButton from "../components/PaypalButton";

const stripePromise=loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const EventDetailsPage=() => {
  const navigate=useNavigate();
  const { id }=useParams();
  const [searchParams]=useSearchParams();
  const retryBookingId=searchParams.get("bookingId") || "";
  const [event, setEvent]=useState(null);
  const [quantity, setQuantity]=useState(1);
  const [paymentMethod, setPaymentMethod]=useState("stripe");
  const [bookingId, setBookingId]=useState("");
  const [stripeClientSecret, setStripeClientSecret]=useState("");
  const [paypalOrderId, setPaypalOrderId]=useState("");
  const [statusMessage, setStatusMessage]=useState("");

  useEffect(() => {
    api.get(`/events/${id}`).then(({ data }) => setEvent(data));
  }, [id]);

  const handleBook=async () => {
    try {
      setStatusMessage("");
      if (!localStorage.getItem("token")) {
        setStatusMessage("Please login first to continue booking.");
        navigate("/login");
        return;
      }
      let currentBookingId=retryBookingId;
      if (!currentBookingId) {
        const { data: booking }=await api.post("/bookings", {
          eventId: id,
          quantity,
          paymentMethod
        });
        currentBookingId=booking._id;
      }
      setBookingId(currentBookingId);
      if (paymentMethod === "stripe") {
        const { data }=await api.post("/payments/stripe/intent", { bookingId: currentBookingId });
        if (data.isMock) {
          await finalizePayment(data.paymentIntentId || `mock_pi_${currentBookingId}`, currentBookingId);
          return;
        }
        setStripeClientSecret(data.clientSecret);
        setStatusMessage("Enter card details below to complete payment.");
      } else {
        const { data }=await api.post("/payments/paypal/order", { bookingId: currentBookingId });
        setPaypalOrderId(data.orderId);
        if (data.isMock) {
          await finalizePayment(data.orderId, currentBookingId);
          return;
        }
        setStatusMessage("Complete payment with PayPal below.");
      }
    } catch (error) {
      setStatusMessage(error?.response?.data?.message || "Booking failed. Please try again.");
    }
  };

  const finalizePayment=async (paymentRef, targetBookingId) => {
    const finalBookingId=targetBookingId || bookingId;
    await api.post("/bookings/confirm-payment", { bookingId: finalBookingId, paymentRef });
    alert("Booking completed");
    setStripeClientSecret("");
    setPaypalOrderId("");
    setStatusMessage("Payment successful. Ticket booked.");
  };

  const handlePaypalApprove=async (orderId) => {
    await api.post("/payments/paypal/capture", { orderId });
    await finalizePayment(orderId);
  };

  if (!event) return <main className="container">Loading...</main>;

  return (
    <main className="container">
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p>{event.city} - {event.venue}</p>
      <p>Price: ${event.price} | Available: {event.availableSeats}</p>
      <div className="booking-box">
        <input type="number" min={1} max={event.availableSeats} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="stripe">Stripe</option>
          <option value="paypal">PayPal</option>
        </select>
        <button className="primary-btn" onClick={handleBook}>Book Now</button>
      </div>
      {statusMessage ? <p className="status-message">{statusMessage}</p> : null}
      {stripeClientSecret && (
        <Elements stripe={stripePromise}>
          <StripeCheckoutForm
            clientSecret={stripeClientSecret}
            onSuccess={finalizePayment}
          />
        </Elements>
      )}
      {paypalOrderId && (
        <PaypalButton
          amount={event.price * quantity}
          createOrder={async () => paypalOrderId}
          onApprove={handlePaypalApprove}
        />
      )}
    </main>
  );
};

export default EventDetailsPage;
