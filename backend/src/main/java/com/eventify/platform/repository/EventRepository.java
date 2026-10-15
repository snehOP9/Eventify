package com.eventify.platform.repository;

import com.eventify.platform.entity.Event;
import com.eventify.platform.entity.EventCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id") Long id);
    List<Event> findByCategory(EventCategory category);
    long countByEventDateGreaterThanEqual(java.time.LocalDate eventDate);
}
