package com.eventify.platform.dto.registration;

import com.eventify.platform.entity.RegistrationStatus;

import java.time.Instant;

public record RegistrationResponse(
        Long id,
        Long eventId,
        String eventTitle,
        Long userId,
        String userName,
        Integer ticketCount,
        RegistrationStatus status,
        Instant registeredAt
) {}
