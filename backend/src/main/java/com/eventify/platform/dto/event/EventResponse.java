package com.eventify.platform.dto.event;

import com.eventify.platform.entity.EventCategory;
import com.eventify.platform.entity.EventMode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record EventResponse(
        Long id,
        String title,
        String description,
        String venue,
        EventCategory category,
        EventMode mode,
        LocalDate eventDate,
        LocalTime eventTime,
        BigDecimal ticketPrice,
        Integer totalSeats,
        Integer seatsLeft,
        String bannerImage,
        Long organizerId,
        String organizerName
) {}
