package com.eventify.platform.service;

import com.eventify.platform.dto.payment.RazorpayOrderRequest;
import com.eventify.platform.dto.payment.RazorpayOrderResponse;
import com.eventify.platform.dto.payment.RazorpayVerifyRequest;
import com.eventify.platform.dto.payment.RazorpayVerifyResponse;
import com.eventify.platform.exception.BadRequestException;
import com.eventify.platform.logging.LogSanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class RazorpayPaymentService {

    @Value("${app.razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret:}")
    private String razorpayKeySecret;

    public RazorpayOrderResponse createOrder(RazorpayOrderRequest request) {
        ensureConfigured();
        log.info(
                "Razorpay order requested eventId={} ticketCount={} amountInRupees={}",
                request.eventId(),
                request.ticketCount(),
                request.amountInRupees()
        );

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
            log.error("Unable to create Razorpay order eventId={} error={}", request.eventId(), LogSanitizer.safeExceptionMessage(exception), exception);
            throw new IllegalStateException("Unable to create Razorpay order: " + exception.getMessage(), exception);
        }
    }

    public RazorpayVerifyResponse verifyPayment(RazorpayVerifyRequest request) {
        ensureConfigured();
        log.info(
                "Razorpay payment verification requested orderId={} paymentId={}",
                LogSanitizer.maskIdentifier(request.razorpayOrderId()),
                LogSanitizer.maskIdentifier(request.razorpayPaymentId())
        );

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
            log.info(
                    "Razorpay payment verified orderId={} paymentId={} status={}",
                    LogSanitizer.maskIdentifier(request.razorpayOrderId()),
                    LogSanitizer.maskIdentifier(request.razorpayPaymentId()),
                    status
            );

            return new RazorpayVerifyResponse(
                    true,
                    request.razorpayPaymentId(),
                    request.razorpayOrderId(),
                    status
            );
        } catch (RazorpayException exception) {
            log.error(
                    "Unable to verify Razorpay payment orderId={} paymentId={} error={}",
                    LogSanitizer.maskIdentifier(request.razorpayOrderId()),
                    LogSanitizer.maskIdentifier(request.razorpayPaymentId()),
                    LogSanitizer.safeExceptionMessage(exception),
                    exception
            );
            throw new BadRequestException("Unable to verify Razorpay payment: " + exception.getMessage());
        }
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
