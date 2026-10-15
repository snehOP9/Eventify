package com.eventify.platform.repository;

import com.eventify.platform.entity.Event;
import com.eventify.platform.entity.EventCategory;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByCategory(EventCategory category);
    long countByEventDateGreaterThanEqual(java.time.LocalDate eventDate);

    @Query("select count(e) from Event e where e.organizer.id = :organizerId")
    long countByOrganizer(@Param("organizerId") Long organizerId);

    @Query("select count(e) from Event e where e.organizer.id = :organizerId and e.eventDate >= :today")
    long countUpcomingByOrganizer(@Param("organizerId") Long organizerId, @Param("today") java.time.LocalDate today);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id") Long id);
}
