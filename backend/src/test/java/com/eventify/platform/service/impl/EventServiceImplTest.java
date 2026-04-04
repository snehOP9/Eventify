package com.eventify.platform.service.impl;

import com.eventify.platform.dto.event.EventRequest;
import com.eventify.platform.dto.event.EventResponse;
import com.eventify.platform.entity.*;
import com.eventify.platform.exception.ResourceNotFoundException;
import com.eventify.platform.repository.EventRepository;
import com.eventify.platform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EventServiceImpl service;

    @Captor
    private ArgumentCaptor<Event> eventCaptor;

    private User organizer;
    private EventRequest request;

    @BeforeEach
    void setUp() {
        organizer = User.builder()
                .id(10L)
                .fullName("Alice Organizer")
                .email("alice@example.com")
                .password("secret")
                .role(UserRole.ORGANIZER)
                .createdAt(Instant.now())
                .build();

        request = new EventRequest(
                "Java Summit",
                "Conference for backend engineers",
                "Main Hall",
                EventCategory.CONFERENCE,
                EventMode.OFFLINE,
                LocalDate.of(2026, 5, 1),
                LocalTime.of(10, 0),
                new BigDecimal("49.99"),
                100,
                "https://img/banner.png",
                organizer.getId()
        );
    }

    @Test
    void createEvent_setsSeatsLeftToTotalSeatsForNewEvent() {
        when(userRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> {
            Event e = invocation.getArgument(0);
            e.setId(1L);
            return e;
        });

        EventResponse response = service.createEvent(request);

        verify(eventRepository).save(eventCaptor.capture());
        Event persisted = eventCaptor.getValue();
        assertThat(persisted.getSeatsLeft()).isEqualTo(request.totalSeats());
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.organizerName()).isEqualTo("Alice Organizer");
    }

    @Test
    void createEvent_throwsWhenOrganizerNotFound() {
        when(userRepository.findById(organizer.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createEvent(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Organizer not found");

        verify(eventRepository, never()).save(any());
    }

    @Test
    void updateEvent_preservesExistingSeatsLeft() {
        Event existing = Event.builder()
                .id(2L)
                .title("Old")
                .description("Old")
                .venue("Old")
                .category(EventCategory.CONFERENCE)
                .mode(EventMode.OFFLINE)
                .eventDate(LocalDate.of(2026, 4, 1))
                .eventTime(LocalTime.of(9, 0))
                .ticketPrice(new BigDecimal("10.00"))
                .totalSeats(20)
                .seatsLeft(5)
                .bannerImage("old")
                .organizer(organizer)
                .build();

        when(eventRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(userRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EventResponse response = service.updateEvent(2L, request);

        assertThat(response.seatsLeft()).isEqualTo(5);
        assertThat(response.totalSeats()).isEqualTo(100);
    }

    @Test
    void deleteEvent_throwsWhenMissing() {
        when(eventRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.deleteEvent(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Event not found");

        verify(eventRepository, never()).deleteById(anyLong());
    }

    @Test
    void getEvent_mapsEntityToResponse() {
        Event event = Event.builder()
                .id(3L)
                .title(request.title())
                .description(request.description())
                .venue(request.venue())
                .category(request.category())
                .mode(request.mode())
                .eventDate(request.eventDate())
                .eventTime(request.eventTime())
                .ticketPrice(request.ticketPrice())
                .totalSeats(request.totalSeats())
                .seatsLeft(88)
                .bannerImage(request.bannerImage())
                .organizer(organizer)
                .build();

        when(eventRepository.findById(3L)).thenReturn(Optional.of(event));

        EventResponse response = service.getEvent(3L);

        assertThat(response.id()).isEqualTo(3L);
        assertThat(response.seatsLeft()).isEqualTo(88);
        assertThat(response.organizerId()).isEqualTo(10L);
    }
}
