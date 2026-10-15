package com.eventify.platform.repository;

import com.eventify.platform.entity.Event;
import com.eventify.platform.entity.EventCategory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByCategory(EventCategory category);
    long countByEventDateGreaterThanEqual(LocalDate eventDate);

    @Query("select count(e) from Event e where e.organizer.id = :organizerId")
    long countByOrganizer(@Param("organizerId") Long organizerId);

    @Query("select count(e) from Event e where e.organizer.id = :organizerId and e.eventDate >= :today")
    long countUpcomingByOrganizer(@Param("organizerId") Long organizerId, @Param("today") LocalDate today);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id") Long id);
}
