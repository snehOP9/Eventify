package com.eventify.platform.dto.payment;

public record RazorpayOrderResponse(
        String keyId,
        String orderId,
        int amount,
        String currency,
        String receipt
) {}
