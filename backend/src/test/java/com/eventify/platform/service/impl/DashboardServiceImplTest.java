package com.eventify.platform.service.impl;

import com.eventify.platform.dto.dashboard.DashboardSummaryResponse;
import com.eventify.platform.repository.EventRepository;
import com.eventify.platform.repository.RegistrationRepository;
import com.eventify.platform.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private RegistrationRepository registrationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DashboardServiceImpl service;

    @Test
    void getOrganizerSummary_usesRepositoryCountForUpcomingEvents() {
        when(eventRepository.count()).thenReturn(12L);
        when(registrationRepository.count()).thenReturn(34L);
        when(userRepository.count()).thenReturn(56L);
        when(eventRepository.countByEventDateGreaterThanEqual(org.mockito.ArgumentMatchers.any(LocalDate.class)))
                .thenReturn(7L);

        LocalDate before = LocalDate.now();
        DashboardSummaryResponse response = service.getOrganizerSummary();
        LocalDate after = LocalDate.now();

        assertThat(response.totalEvents()).isEqualTo(12L);
        assertThat(response.totalRegistrations()).isEqualTo(34L);
        assertThat(response.activeUsers()).isEqualTo(56L);
        assertThat(response.upcomingEvents()).isEqualTo(7L);

        ArgumentCaptor<LocalDate> dateCaptor = ArgumentCaptor.forClass(LocalDate.class);
        verify(eventRepository).countByEventDateGreaterThanEqual(dateCaptor.capture());
        assertThat(dateCaptor.getValue()).isBetween(before, after);
    }
}
