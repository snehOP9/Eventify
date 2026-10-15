package com.eventify.platform.service.impl;

import com.eventify.platform.dto.dashboard.DashboardSummaryResponse;
import com.eventify.platform.entity.RegistrationStatus;
import com.eventify.platform.entity.User;
import com.eventify.platform.entity.UserRole;
import com.eventify.platform.exception.ResourceNotFoundException;
import com.eventify.platform.repository.EventRepository;
import com.eventify.platform.repository.RegistrationRepository;
import com.eventify.platform.repository.UserRepository;
import com.eventify.platform.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    @Override
    public DashboardSummaryResponse getSummaryForCurrentUser() {
        User user = currentUser();
        return switch (user.getRole()) {
            case ADMIN -> globalSummary();
            case ORGANIZER -> organizerSummary(user.getId());
            case ATTENDEE -> attendeeSummary(user.getId());
        };
    }

    @Override
    public DashboardSummaryResponse getOrganizerSummary() {
        User user = currentUser();
        if (user.getRole() == UserRole.ADMIN) return globalSummary();
        if (user.getRole() != UserRole.ORGANIZER) {
            throw new AccessDeniedException("Organizer dashboard access required");
        }
        return organizerSummary(user.getId());
    }

    @Override
    public DashboardSummaryResponse getAttendeeSummary() {
        User user = currentUser();
        if (user.getRole() == UserRole.ADMIN) return globalSummary();
        if (user.getRole() != UserRole.ATTENDEE) {
            throw new AccessDeniedException("Attendee dashboard access required");
        }
        return attendeeSummary(user.getId());
    }

    private DashboardSummaryResponse globalSummary() {
        return new DashboardSummaryResponse(
                eventRepository.count(),
                registrationRepository.countByStatus(RegistrationStatus.CONFIRMED),
                userRepository.countActiveUsers(Instant.now()),
                eventRepository.countByEventDateGreaterThanEqual(LocalDate.now())
        );
    }

    private DashboardSummaryResponse organizerSummary(Long organizerId) {
        return new DashboardSummaryResponse(
                eventRepository.countByOrganizer(organizerId),
                registrationRepository.countByOrganizerAndStatus(organizerId, RegistrationStatus.CONFIRMED),
                userRepository.countActiveUsers(Instant.now()),
                eventRepository.countUpcomingByOrganizer(organizerId, LocalDate.now())
        );
    }

    private DashboardSummaryResponse attendeeSummary(Long userId) {
        return new DashboardSummaryResponse(
                eventRepository.count(),
                registrationRepository.countByUserAndStatus(userId, RegistrationStatus.CONFIRMED),
                userRepository.countActiveUsers(Instant.now()),
                registrationRepository.countUpcomingByUserAndStatus(userId, RegistrationStatus.CONFIRMED, LocalDate.now())
        );
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
            throw new AccessDeniedException("Authentication required");
        }
        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
