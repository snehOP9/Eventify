package com.eventify.platform.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record RazorpayOrderRequest(
        @NotNull @DecimalMin("0.01") BigDecimal amountInRupees,
        @NotBlank String eventId,
        @NotNull @Positive Integer ticketCount,
        @NotBlank String attendeeName,
        @NotBlank @Email String attendeeEmail,
        @NotBlank String attendeePhone
) {}
