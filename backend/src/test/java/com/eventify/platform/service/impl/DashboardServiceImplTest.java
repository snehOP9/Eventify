package com.eventify.platform.service.impl;

import com.eventify.platform.dto.dashboard.DashboardSummaryResponse;
import com.eventify.platform.entity.User;
import com.eventify.platform.entity.UserRole;
import com.eventify.platform.repository.EventRepository;
import com.eventify.platform.repository.RegistrationRepository;
import com.eventify.platform.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {
    @Mock private EventRepository eventRepository;
    @Mock private RegistrationRepository registrationRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private DashboardServiceImpl service;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticate(String email, UserRole role, long id) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setRole(role);
        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(user));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, "password",
                        List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.name()))));
    }

    @Test
    void organizerSummaryIsScopedToTheOrganizerAndCountsOnlyActiveUsers() {
        authenticate("organizer@example.test", UserRole.ORGANIZER, 10L);
        when(eventRepository.countByOrganizer(10L)).thenReturn(3L);
        when(registrationRepository.countByOrganizerAndStatus(eq(10L), any())).thenReturn(12L);
        when(userRepository.countActiveUsers(any(Instant.class))).thenReturn(5L);
        when(eventRepository.countUpcomingByOrganizer(eq(10L), any(LocalDate.class))).thenReturn(2L);

        DashboardSummaryResponse summary = service.getSummaryForCurrentUser();

        assertEquals(3L, summary.totalEvents());
        assertEquals(12L, summary.totalRegistrations());
        assertEquals(5L, summary.activeUsers());
        assertEquals(2L, summary.upcomingEvents());
        verify(eventRepository, never()).count();
    }

    @Test
    void attendeeSummaryUsesOnlyTheirRegistrationsForRegistrationMetrics() {
        authenticate("attendee@example.test", UserRole.ATTENDEE, 11L);
        when(eventRepository.count()).thenReturn(20L);
        when(registrationRepository.countByUserAndStatus(eq(11L), any())).thenReturn(2L);
        when(userRepository.countActiveUsers(any(Instant.class))).thenReturn(8L);
        when(registrationRepository.countUpcomingByUserAndStatus(eq(11L), any(), any(LocalDate.class))).thenReturn(1L);

        DashboardSummaryResponse summary = service.getSummaryForCurrentUser();

        assertEquals(20L, summary.totalEvents());
        assertEquals(2L, summary.totalRegistrations());
        assertEquals(8L, summary.activeUsers());
        assertEquals(1L, summary.upcomingEvents());
        verify(eventRepository, never()).countByOrganizer(anyLong());
    }

    @Test
    void attendeeCannotReadOrganizerOnlyDashboardEndpoint() {
        authenticate("attendee@example.test", UserRole.ATTENDEE, 11L);
        assertThrows(AccessDeniedException.class, () -> service.getOrganizerSummary());
    }
}
