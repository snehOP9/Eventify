package com.eventify.platform.service;

import com.eventify.platform.dto.payment.RazorpayOrderRequest;
import com.eventify.platform.dto.payment.RazorpayOrderResponse;
import com.eventify.platform.dto.payment.RazorpayVerifyRequest;
import com.eventify.platform.dto.payment.RazorpayVerifyResponse;
import com.eventify.platform.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RazorpayPaymentService {

    @Value("${app.razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret:}")
    private String razorpayKeySecret;

    public RazorpayOrderResponse createOrder(RazorpayOrderRequest request) {
        ensureConfigured();

        int amountInPaise = request.amountInRupees()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();

        String receipt = "evt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", receipt);
            options.put("notes", new JSONObject()
                    .put("eventId", request.eventId())
                    .put("ticketCount", request.ticketCount())
                    .put("attendeeEmail", request.attendeeEmail())
            );

            Order order = razorpayClient.orders.create(options);

            return new RazorpayOrderResponse(
                    razorpayKeyId,
                    order.get("id"),
                    amountInPaise,
                    "INR",
                    receipt
            );
        } catch (RazorpayException exception) {
            throw new IllegalStateException("Unable to create Razorpay order: " + exception.getMessage(), exception);
        }
    }

    public RazorpayVerifyResponse verifyPayment(RazorpayVerifyRequest request) {
        ensureConfigured();

        try {
            JSONObject payload = new JSONObject();
            payload.put("razorpay_order_id", request.razorpayOrderId());
            payload.put("razorpay_payment_id", request.razorpayPaymentId());
            payload.put("razorpay_signature", request.razorpaySignature());

            boolean validSignature = Utils.verifyPaymentSignature(payload, razorpayKeySecret);
            if (!validSignature) {
                throw new BadRequestException("Invalid Razorpay signature.");
            }

            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            Payment payment = razorpayClient.payments.fetch(request.razorpayPaymentId());

            String orderIdFromGateway = readString(payment, "order_id");
            if (!request.razorpayOrderId().equals(orderIdFromGateway)) {
                throw new BadRequestException("Payment order mismatch.");
            }

            String status = readString(payment, "status");
            if (!"authorized".equalsIgnoreCase(status) && !"captured".equalsIgnoreCase(status)) {
                throw new BadRequestException("Payment is not completed. Current status: " + status);
            }

            return new RazorpayVerifyResponse(
                    true,
                    request.razorpayPaymentId(),
                    request.razorpayOrderId(),
                    status
            );
        } catch (RazorpayException exception) {
            throw new BadRequestException("Unable to verify Razorpay payment: " + exception.getMessage());
        }
    }

    /**
     * Confirms an actual captured Razorpay payment for the specific event and ticket quantity.
     * Registration must never rely only on a browser-supplied payment identifier or a
     * previously successful response from the public verification endpoint.
     */
    public void verifyRegistrationPayment(String paymentId, Long eventId, int ticketCount, BigDecimal unitPrice) {
        ensureConfigured();
        if (paymentId == null || paymentId.isBlank()) {
            throw new BadRequestException("Payment is required for this event.");
        }

        int expectedAmount = unitPrice.multiply(BigDecimal.valueOf(ticketCount))
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            Payment payment = client.payments.fetch(paymentId);
            if (!paymentId.equals(readString(payment, "id")) || !"captured".equalsIgnoreCase(readString(payment, "status"))) {
                throw new BadRequestException("A captured payment is required to register.");
            }

            String orderId = readString(payment, "order_id");
            if (orderId.isBlank()) {
                throw new BadRequestException("The payment is not associated with an order.");
            }

            Order order = client.orders.fetch(orderId);
            JSONObject notes = order.has("notes") ? order.optJSONObject("notes") : null;

            validateRegistrationPaymentDetails(
                    paymentId,
                    readString(payment, "id"),
                    readString(payment, "status"),
                    orderId,
                    readString(order, "id"),
                    payment.getInt("amount"),
                    payment.getString("currency"),
                    order.getInt("amount"),
                    order.getString("currency"),
                    notes == null ? null : notes.optString("eventId", ""),
                    notes == null ? null : notes.optString("ticketCount", ""),
                    eventId,
                    ticketCount,
                    expectedAmount
            );
        } catch (RazorpayException exception) {
            throw new BadRequestException("Unable to confirm payment with the payment provider.");
        }
    }

    static void validateRegistrationPaymentDetails(
            String requestedPaymentId,
            String gatewayPaymentId,
            String paymentStatus,
            String gatewayOrderId,
            String orderRecordId,
            int paymentAmount,
            String paymentCurrency,
            int orderAmount,
            String orderCurrency,
            String noteEventId,
            String noteTicketCount,
            Long eventId,
            int ticketCount,
            int expectedAmount
    ) {
        if (!requestedPaymentId.equals(gatewayPaymentId)
                || !"captured".equalsIgnoreCase(paymentStatus)
                || !gatewayOrderId.equals(orderRecordId)
                || paymentAmount != expectedAmount
                || orderAmount != expectedAmount
                || !"INR".equalsIgnoreCase(paymentCurrency)
                || !"INR".equalsIgnoreCase(orderCurrency)
                || !String.valueOf(eventId).equals(noteEventId)
                || !String.valueOf(ticketCount).equals(noteTicketCount)) {
            throw new BadRequestException("Payment does not match the requested event and tickets.");
        }
    }

    private String readString(Order order, String fieldName) {
        if (order == null || !order.has(fieldName)) {
            return "";
        }
        Object value = order.get(fieldName);
        return value == null ? "" : String.valueOf(value);
    }

    private void ensureConfigured() {
        if (razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new IllegalStateException("Razorpay is not configured. Set APP_RAZORPAY_KEY_ID and APP_RAZORPAY_KEY_SECRET.");
        }
    }

    private String readString(Payment payment, String fieldName) {
        if (payment == null || !payment.has(fieldName)) {
            return "";
        }

        Object value = payment.get(fieldName);
        return value == null ? "" : String.valueOf(value);
    }
}
