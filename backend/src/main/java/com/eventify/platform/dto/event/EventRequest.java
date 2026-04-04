package com.eventify.platform.dto.event;

import com.eventify.platform.entity.EventCategory;
import com.eventify.platform.entity.EventMode;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record EventRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotBlank String venue,
        @NotNull EventCategory category,
        @NotNull EventMode mode,
        @NotNull LocalDate eventDate,
        @NotNull LocalTime eventTime,
        @NotNull @DecimalMin("0") BigDecimal ticketPrice,
        @NotNull @Positive Integer totalSeats,
        @NotBlank String bannerImage,
        @NotNull Long organizerId
) {}
