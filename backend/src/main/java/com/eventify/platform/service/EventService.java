package com.eventify.platform.service;

import com.eventify.platform.dto.event.EventRequest;
import com.eventify.platform.dto.event.EventResponse;

import java.util.List;

public interface EventService {
    EventResponse createEvent(EventRequest request);
    EventResponse updateEvent(Long id, EventRequest request);
    void deleteEvent(Long id);
    EventResponse getEvent(Long id);
    List<EventResponse> getAllEvents();
}
