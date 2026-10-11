package com.eventify.platform.service.impl;

import com.eventify.platform.dto.event.EventRequest;
import com.eventify.platform.dto.event.EventResponse;
import com.eventify.platform.entity.Event;
import com.eventify.platform.entity.User;
import com.eventify.platform.entity.UserRole;
import com.eventify.platform.exception.BadRequestException;
import com.eventify.platform.exception.ResourceNotFoundException;
import com.eventify.platform.repository.EventRepository;
import com.eventify.platform.repository.UserRepository;
import com.eventify.platform.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public EventResponse createEvent(EventRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != UserRole.ADMIN && currentUser.getRole() != UserRole.ORGANIZER) {
            throw new AccessDeniedException("Only organizers and admins can create events");
        }
        User organizer = getOrganizer(request.organizerId());
        if (currentUser.getRole() != UserRole.ADMIN
                && !organizer.getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Organizers can only create events for themselves");
        }
        Event event = buildEntity(new Event(), request, organizer);
        return map(eventRepository.save(event));
    }

    @Override
    @Transactional
    public EventResponse updateEvent(Long id, EventRequest request) {
        User currentUser = getCurrentUser();
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        requireOwnerOrAdmin(event, currentUser);
        int bookedSeats = event.getTotalSeats() - event.getSeatsLeft();
        if (request.totalSeats() < bookedSeats) {
            throw new com.eventify.platform.exception.BadRequestException(
                    "Total seats cannot be lower than the number of existing bookings");
        }

        User organizer = event.getOrganizer();
        int updatedSeatsLeft = event.getSeatsLeft() + request.totalSeats() - event.getTotalSeats();
        Event updatedEvent = buildEntity(event, request, organizer);
        updatedEvent.setSeatsLeft(updatedSeatsLeft);
        return map(eventRepository.save(updatedEvent));
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        User currentUser = getCurrentUser();
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        requireOwnerOrAdmin(event, currentUser);
        eventRepository.delete(event);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse getEvent(Long id) {
        return eventRepository.findById(id)
                .map(this::map)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream().map(this::map).toList();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
            throw new BadRequestException("Authentication required");
        }
        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private void requireOwnerOrAdmin(Event event, User currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN
                && (currentUser.getRole() != UserRole.ORGANIZER
                || !event.getOrganizer().getId().equals(currentUser.getId()))) {
            throw new AccessDeniedException("You are not authorized to modify this event");
        }
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
