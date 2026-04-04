package com.eventify.platform.dto.registration;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RegistrationRequest(
        @NotNull Long eventId,
        @NotNull Long userId,
        @NotNull @Positive Integer ticketCount
) {}
