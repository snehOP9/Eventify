package com.eventify.platform.dto.dashboard;

public record DashboardSummaryResponse(
        long totalEvents,
        long totalRegistrations,
        long activeUsers,
        long upcomingEvents
) {}
