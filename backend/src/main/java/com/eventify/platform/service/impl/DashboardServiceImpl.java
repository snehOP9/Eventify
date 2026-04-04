package com.eventify.platform.service.impl;

import com.eventify.platform.dto.dashboard.DashboardSummaryResponse;
import com.eventify.platform.repository.EventRepository;
import com.eventify.platform.repository.RegistrationRepository;
import com.eventify.platform.repository.UserRepository;
import com.eventify.platform.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    @Override
    public DashboardSummaryResponse getOrganizerSummary() {
        long totalEvents = eventRepository.count();
        long totalRegistrations = registrationRepository.count();
        long activeUsers = userRepository.count();
        long upcomingEvents = eventRepository.findAll().stream()
                .filter(event -> !event.getEventDate().isBefore(LocalDate.now()))
                .count();

        return new DashboardSummaryResponse(totalEvents, totalRegistrations, activeUsers, upcomingEvents);
    }
}
