package com.eventify.platform.service.impl;

import com.eventify.platform.dto.event.EventRequest;
import com.eventify.platform.dto.event.EventResponse;
import com.eventify.platform.entity.Event;
import com.eventify.platform.entity.User;
import com.eventify.platform.exception.ResourceNotFoundException;
import com.eventify.platform.repository.EventRepository;
import com.eventify.platform.repository.UserRepository;
import com.eventify.platform.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Override
    public EventResponse createEvent(EventRequest request) {
        User organizer = getOrganizer(request.organizerId());
        Event event = buildEntity(new Event(), request, organizer);
        return map(eventRepository.save(event));
    }

    @Override
    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        User organizer = getOrganizer(request.organizerId());
        return map(eventRepository.save(buildEntity(event, request, organizer)));
    }

    @Override
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found");
        }
        eventRepository.deleteById(id);
    }

    @Override
    public EventResponse getEvent(Long id) {
        return eventRepository.findById(id)
                .map(this::map)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    }

    @Override
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream().map(this::map).toList();
    }

    private User getOrganizer(Long organizerId) {
        return userRepository.findById(organizerId)
                .orElseThrow(() -> new ResourceNotFoundException("Organizer not found"));
    }

    private Event buildEntity(Event event, EventRequest request, User organizer) {
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setVenue(request.venue());
        event.setCategory(request.category());
        event.setMode(request.mode());
        event.setEventDate(request.eventDate());
        event.setEventTime(request.eventTime());
        event.setTicketPrice(request.ticketPrice());
        event.setTotalSeats(request.totalSeats());
        event.setSeatsLeft(event.getSeatsLeft() == null ? request.totalSeats() : event.getSeatsLeft());
        event.setBannerImage(request.bannerImage());
        event.setOrganizer(organizer);
        return event;
    }

    private EventResponse map(Event event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getVenue(),
                event.getCategory(),
                event.getMode(),
                event.getEventDate(),
                event.getEventTime(),
                event.getTicketPrice(),
                event.getTotalSeats(),
                event.getSeatsLeft(),
                event.getBannerImage(),
                event.getOrganizer().getId(),
                event.getOrganizer().getFullName()
        );
    }
}
