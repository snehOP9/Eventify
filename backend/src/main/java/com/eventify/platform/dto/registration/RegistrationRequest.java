package com.eventify.platform.dto.registration;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.Valid;

public record RegistrationRequest(
        @NotNull Long eventId,
        Long userId,
        @Positive Integer ticketCount,
        @Valid RegistrationAttendeeRequest attendee,
        @Positive Integer quantity,
        String paymentId
) {}
