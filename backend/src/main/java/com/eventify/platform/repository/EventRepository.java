package com.eventify.platform.repository;

import com.eventify.platform.entity.Event;
import com.eventify.platform.entity.EventCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByCategory(EventCategory category);
}
