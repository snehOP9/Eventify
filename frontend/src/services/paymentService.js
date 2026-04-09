import apiClient from "./apiClient";

let razorpayScriptPromise;

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

const loadRazorpayScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay is only available in browser"));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
};

export const createRazorpayOrder = async ({ amountInRupees, eventId, ticketCount, attendeeName, attendeeEmail, attendeePhone }) => {
  if (useMockApi) {
    return {
      keyId: "rzp_test_mockkey",
      orderId: `order_mock_${Date.now()}`,
      amount: Math.round(Number(amountInRupees) * 100),
      currency: "INR",
      receipt: `mock_${eventId}_${Date.now()}`,
      eventId,
      ticketCount,
      attendeeName,
      attendeeEmail,
      attendeePhone
    };
  }

  const payload = {
    amountInRupees,
    eventId,
    ticketCount,
    attendeeName,
    attendeeEmail,
    attendeePhone
  };

  const { data } = await apiClient.post("/payments/razorpay/order", payload);
  return data;
};

export const openRazorpayCheckout = async ({ order, prefill }) => {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Eventify",
      description: "Event ticket booking",
      order_id: order.orderId,
      prefill,
      theme: {
        color: "#62f0d4"
      },
      handler: (response) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled"))
      }
    };

    const instance = new window.Razorpay(options);
    instance.on("payment.failed", (error) => {
      reject(new Error(error?.error?.description || "Payment failed"));
    });
    instance.open();
  });
};
