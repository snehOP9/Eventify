package com.eventify.platform.dto.payment;

public record RazorpayVerifyResponse(
        boolean verified,
        String paymentId,
        String orderId,
        String status
) {}