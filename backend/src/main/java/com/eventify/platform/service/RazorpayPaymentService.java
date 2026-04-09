package com.eventify.platform.service;

import com.eventify.platform.dto.payment.RazorpayOrderRequest;
import com.eventify.platform.dto.payment.RazorpayOrderResponse;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

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
        if (razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new IllegalStateException("Razorpay is not configured. Set APP_RAZORPAY_KEY_ID and APP_RAZORPAY_KEY_SECRET.");
        }

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
}
