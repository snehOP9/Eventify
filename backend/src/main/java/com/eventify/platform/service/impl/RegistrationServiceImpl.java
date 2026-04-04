package com.eventify.platform.service.impl;

import com.eventify.platform.dto.registration.RegistrationRequest;
import com.eventify.platform.dto.registration.RegistrationResponse;
import com.eventify.platform.entity.Event;
import com.eventify.platform.entity.Registration;
import com.eventify.platform.entity.RegistrationStatus;
import com.eventify.platform.entity.User;
import com.eventify.platform.exception.BadRequestException;
import com.eventify.platform.exception.ResourceNotFoundException;
import com.eventify.platform.repository.EventRepository;
import com.eventify.platform.repository.RegistrationRepository;
import com.eventify.platform.repository.UserRepository;
import com.eventify.platform.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Override
    public RegistrationResponse register(RegistrationRequest request) {
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (event.getSeatsLeft() < request.ticketCount()) {
            throw new BadRequestException("Not enough seats left");
        }

        event.setSeatsLeft(event.getSeatsLeft() - request.ticketCount());
        eventRepository.save(event);

        Registration registration = Registration.builder()
                .event(event)
                .user(user)
                .ticketCount(request.ticketCount())
                .status(RegistrationStatus.CONFIRMED)
                .registeredAt(Instant.now())
                .build();

        return map(registrationRepository.save(registration));
    }

    @Override
    public List<RegistrationResponse> getRegistrationsByUser(Long userId) {
        return registrationRepository.findByUserId(userId).stream().map(this::map).toList();
    }

    @Override
    public void cancelRegistration(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            return;
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        Event event = registration.getEvent();
        event.setSeatsLeft(event.getSeatsLeft() + registration.getTicketCount());
        eventRepository.save(event);
        registrationRepository.save(registration);
    }

    private RegistrationResponse map(Registration registration) {
        return new RegistrationResponse(
                registration.getId(),
                registration.getEvent().getId(),
                registration.getEvent().getTitle(),
                registration.getUser().getId(),
                registration.getUser().getFullName(),
                registration.getTicketCount(),
                registration.getStatus(),
                registration.getRegisteredAt()
        );
    }
}
