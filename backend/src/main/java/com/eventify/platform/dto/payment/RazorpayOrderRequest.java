package com.eventify.platform.dto.payment;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;


public record RazorpayOrderRequest(
        @NotBlank String eventId,
        @NotNull @Positive Integer ticketCount,
        @NotBlank String attendeeName,
        @NotBlank @Email String attendeeEmail,
        @NotBlank String attendeePhone
) {}
