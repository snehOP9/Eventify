package com.eventify.platform.service;

import com.eventify.platform.exception.BadRequestException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class RazorpayRegistrationValidationTest {

    private static void verify(
            String paymentId, String status, String orderId, int paid,
            String paymentCurrency, int ordered, String orderCurrency,
            String event, String count
    ) {
        RazorpayPaymentService.validateRegistrationPaymentDetails(
                "pay_abc", paymentId, status, "order_expected", orderId,
                paid, paymentCurrency, ordered, orderCurrency,
                event, count, 123L, 2, 20000);
    }

    @Test
    void acceptsExactCapturedPaymentLinkedToThisEventAndTicketCount() {
        assertDoesNotThrow(() -> verify(
                "pay_abc", "captured", "order_expected", 20000,
                "INR", 20000, "INR", "123", "2"));
    }

    @Test
    void rejectsMismatchedOrUncapturedPayments() {
        assertThrows(BadRequestException.class, () -> verify(
                "pay_other", "captured", "order_expected", 20000,
                "INR", 20000, "INR", "123", "2"));
        assertThrows(BadRequestException.class, () -> verify(
                "pay_abc", "authorized", "order_expected", 20000,
                "INR", 20000, "INR", "123", "2"));
        assertThrows(BadRequestException.class, () -> verify(
                "pay_abc", "captured", "order_other", 20000,
                "INR", 20000, "INR", "123", "2"));
    }

    @Test
    void rejectsUnderpaymentsAndCurrencyMismatches() {
        assertThrows(BadRequestException.class, () -> verify(
                "pay_abc", "captured", "order_expected", 100,
                "INR", 20000, "INR", "123", "2"));
        assertThrows(BadRequestException.class, () -> verify(
                "pay_abc", "captured", "order_expected", 20000,
                "INR", 100, "INR", "123", "2"));
        assertThrows(BadRequestException.class, () -> verify(
                "pay_abc", "captured", "order_expected", 20000,
                "USD", 20000, "INR", "123", "2"));
    }

    @Test
    void rejectsPaymentFromAnotherEventOrTicketCount() {
        assertThrows(BadRequestException.class, () -> verify(
                "pay_abc", "captured", "order_expected", 20000,
                "INR", 20000, "INR", "124", "2"));
        assertThrows(BadRequestException.class, () -> verify(
                "pay_abc", "captured", "order_expected", 20000,
                "INR", 20000, "INR", "123", "1"));
    }
}
