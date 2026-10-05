package com.eventify.platform.repository;

import com.eventify.platform.entity.Event;
import com.eventify.platform.entity.EventCategory;
import com.eventify.platform.entity.EventMode;
import com.eventify.platform.entity.User;
import com.eventify.platform.entity.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class EventRepositoryTest {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void countByEventDateGreaterThanEqual_includesTodayAndFutureOnly() {
        User organizer = userRepository.save(User.builder()
                .fullName("Test Organizer")
                .email("organizer@example.com")
                .password("test-password")
                .role(UserRole.ORGANIZER)
                .createdAt(Instant.now())
                .build());

        LocalDate today = LocalDate.now();
        eventRepository.save(event("Past", today.minusDays(1), organizer));
        eventRepository.save(event("Today", today, organizer));
        eventRepository.save(event("Future", today.plusDays(1), organizer));

        assertThat(eventRepository.countByEventDateGreaterThanEqual(today)).isEqualTo(2L);
    }

    private Event event(String title, LocalDate date, User organizer) {
        return Event.builder()
                .title(title)
                .description("Repository test event")
                .venue("Test Hall")
                .category(EventCategory.CONFERENCE)
                .mode(EventMode.OFFLINE)
                .eventDate(date)
                .eventTime(LocalTime.NOON)
                .ticketPrice(BigDecimal.TEN)
                .totalSeats(10)
                .seatsLeft(10)
                .bannerImage("https://example.com/banner.png")
                .organizer(organizer)
                .build();
    }
}
