import { useEffect, useRef } from "react";
import { loadScript } from "@paypal/paypal-js";

const PaypalButton=({ amount, createOrder, onApprove }) => {
  const ref=useRef(null);

  useEffect(() => {
    let mounted=true;
    const renderButtons=async () => {
      const paypal=await loadScript({
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID
      });
      if (!mounted || !paypal || !ref.current) return;
      ref.current.innerHTML="";
      paypal
        .Buttons({
          createOrder: async () => createOrder(),
          onApprove: async (data) => onApprove(data.orderID),
          onError: (err) => alert(err?.message || "PayPal payment failed")
        })
        .render(ref.current);
    };
    renderButtons();
    return () => {
      mounted=false;
    };
  }, [amount, createOrder, onApprove]);

  return <div ref={ref} />;
};

export default PaypalButton;
