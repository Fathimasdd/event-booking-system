import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

const StripeCheckoutForm=({ clientSecret, onSuccess }) => {
  const stripe=useStripe();
  const elements=useElements();

  const handleSubmit=async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const card=elements.getElement(CardElement);
    const result=await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card }
    });
    if (result.error) {
      alert(result.error.message);
      return;
    }
    if (result.paymentIntent?.status === "succeeded") {
      onSuccess(result.paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="card-element-box">
        <CardElement />
      </div>
      <button type="submit" className="primary-btn">Pay with Stripe</button>
    </form>
  );
};

export default StripeCheckoutForm;
