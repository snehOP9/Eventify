package com.eventify.platform.service;

import com.eventify.platform.dto.payment.RazorpayOrderRequest;
import com.eventify.platform.dto.payment.RazorpayOrderResponse;
import com.eventify.platform.dto.payment.RazorpayVerifyRequest;
import com.eventify.platform.dto.payment.RazorpayVerifyResponse;
import com.eventify.platform.entity.Event;
import com.eventify.platform.exception.BadRequestException;
import com.eventify.platform.exception.ResourceNotFoundException;
import com.eventify.platform.repository.EventRepository;
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

    private final EventRepository eventRepository;

    @Value("${app.razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret:}")
    private String razorpayKeySecret;

    public RazorpayOrderResponse createOrder(RazorpayOrderRequest request) {
        ensureConfigured();

        long eventId;
        try {
            eventId = Long.parseLong(request.eventId());
        } catch (NumberFormatException exception) {
            throw new BadRequestException("Invalid event ID.");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found."));
        if (event.getSeatsLeft() == null || event.getSeatsLeft() < request.ticketCount()) {
            throw new BadRequestException("Not enough seats left.");
        }

        BigDecimal amountInRupees = event.getTicketPrice()
                .multiply(BigDecimal.valueOf(request.ticketCount()));
        if (amountInRupees.signum() <= 0) {
            throw new BadRequestException("Payment is not required for a free event.");
        }

        int amountInPaise = amountInRupees
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
        VerifiedPayment verified = verifyPaymentWithGateway(request);
        return new RazorpayVerifyResponse(
                true,
                request.razorpayPaymentId(),
                request.razorpayOrderId(),
                verified.status()
        );
    }

    public void verifyPaymentForRegistration(
            RazorpayVerifyRequest request,
            Long expectedEventId,
            int expectedTicketCount,
            String expectedAttendeeEmail,
            int expectedAmountInPaise
    ) {
        VerifiedPayment verified = verifyPaymentWithGateway(request);
        if (!String.valueOf(expectedEventId).equals(verified.eventId())
                || expectedTicketCount != verified.ticketCount()
                || expectedAttendeeEmail == null
                || !expectedAttendeeEmail.trim().equalsIgnoreCase(verified.attendeeEmail())
                || expectedAmountInPaise != verified.amountInPaise()) {
            throw new BadRequestException("Payment does not match this event registration.");
        }
    }

    private VerifiedPayment verifyPaymentWithGateway(RazorpayVerifyRequest request) {
        ensureConfigured();
        if (request == null || request.razorpayOrderId() == null || request.razorpayOrderId().isBlank()
                || request.razorpayPaymentId() == null || request.razorpayPaymentId().isBlank()
                || request.razorpaySignature() == null || request.razorpaySignature().isBlank()) {
            throw new BadRequestException("Razorpay order, payment, and signature are required.");
        }

        try {
            JSONObject payload = new JSONObject();
            payload.put("razorpay_order_id", request.razorpayOrderId());
            payload.put("razorpay_payment_id", request.razorpayPaymentId());
            payload.put("razorpay_signature", request.razorpaySignature());

            if (!Utils.verifyPaymentSignature(payload, razorpayKeySecret)) {
                throw new BadRequestException("Invalid Razorpay signature.");
            }

            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            Order order = razorpayClient.orders.fetch(request.razorpayOrderId());
            Payment payment = razorpayClient.payments.fetch(request.razorpayPaymentId());

            String orderIdFromGateway = readString(payment, "order_id");
            if (!request.razorpayOrderId().equals(orderIdFromGateway)) {
                throw new BadRequestException("Payment order mismatch.");
            }

            String status = readString(payment, "status");
            if (!"captured".equalsIgnoreCase(status)) {
                throw new BadRequestException("Payment has not been captured.");
            }

            String currency = readOrderString(order, "currency");
            int orderAmount = Integer.parseInt(readOrderString(order, "amount"));
            int paymentAmount = Integer.parseInt(readString(payment, "amount"));
            if (!"INR".equalsIgnoreCase(currency) || orderAmount <= 0 || paymentAmount != orderAmount) {
                throw new BadRequestException("Payment amount or currency mismatch.");
            }

            Object notesValue = order.get("notes");
            JSONObject notes = notesValue instanceof JSONObject
                    ? (JSONObject) notesValue
                    : new JSONObject(notesValue == null ? "{}" : String.valueOf(notesValue));
            String eventId = notes.optString("eventId", "");
            int ticketCount = notes.optInt("ticketCount", 0);
            String attendeeEmail = notes.optString("attendeeEmail", "").trim();
            if (eventId.isBlank() || ticketCount <= 0 || attendeeEmail.isBlank()) {
                throw new BadRequestException("Payment order is missing registration details.");
            }

            return new VerifiedPayment(status, eventId, ticketCount, attendeeEmail, paymentAmount);
        } catch (RazorpayException exception) {
            throw new BadRequestException("Unable to verify Razorpay payment.");
        } catch (NumberFormatException exception) {
            throw new BadRequestException("Razorpay returned an invalid payment amount.");
        }
    }

    private record VerifiedPayment(
            String status,
            String eventId,
            int ticketCount,
            String attendeeEmail,
            int amountInPaise
    ) {}
    private void ensureConfigured() {
        if (razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new IllegalStateException("Razorpay is not configured. Set APP_RAZORPAY_KEY_ID and APP_RAZORPAY_KEY_SECRET.");
        }
    }

    private String readOrderString(Order order, String fieldName) {
        if (order == null || !order.has(fieldName)) {
            return "";
        }
        Object value = order.get(fieldName);
        return value == null ? "" : String.valueOf(value);
    }

    private String readString(Payment payment, String fieldName) {
        if (payment == null || !payment.has(fieldName)) {
            return "";
        }

        Object value = payment.get(fieldName);
        return value == null ? "" : String.valueOf(value);
    }
}
