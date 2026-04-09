package com.eventify.platform.service.impl;

import com.eventify.platform.dto.registration.RegistrationRequest;
import com.eventify.platform.dto.registration.RegistrationResponse;
import com.eventify.platform.entity.AuthProvider;
import com.eventify.platform.entity.Event;
import com.eventify.platform.entity.Registration;
import com.eventify.platform.entity.RegistrationStatus;
import com.eventify.platform.entity.User;
import com.eventify.platform.entity.UserRole;
import com.eventify.platform.exception.BadRequestException;
import com.eventify.platform.exception.ResourceNotFoundException;
import com.eventify.platform.repository.EventRepository;
import com.eventify.platform.repository.RegistrationRepository;
import com.eventify.platform.repository.UserRepository;
import com.eventify.platform.service.EmailService;
import com.eventify.platform.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public RegistrationResponse register(RegistrationRequest request) {
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        int ticketCount = request.ticketCount() != null ? request.ticketCount() : (request.quantity() != null ? request.quantity() : 0);
        if (ticketCount <= 0) {
            throw new BadRequestException("Ticket count must be greater than 0");
        }

        User user = resolveUser(request);

        if (event.getSeatsLeft() < ticketCount) {
            throw new BadRequestException("Not enough seats left");
        }

        event.setSeatsLeft(event.getSeatsLeft() - ticketCount);
        eventRepository.save(event);

        Registration registration = Registration.builder()
                .event(event)
                .user(user)
            .ticketCount(ticketCount)
            .paymentId(request.paymentId())
                .status(RegistrationStatus.CONFIRMED)
                .registeredAt(Instant.now())
                .build();

        Registration saved = registrationRepository.save(registration);
        String confirmationCode = "EV-" + saved.getId();
        emailService.sendRegistrationConfirmation(
            user.getEmail(),
            user.getFullName(),
            event.getTitle(),
            event.getEventDate().toString(),
            event.getEventTime().toString(),
            event.getVenue(),
            ticketCount,
            request.paymentId() == null ? "N/A" : request.paymentId(),
            confirmationCode
        );

        return map(saved);
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
                registration.getPaymentId(),
                registration.getStatus(),
                registration.getRegisteredAt()
        );
    }

    private User resolveUser(RegistrationRequest request) {
        if (request.userId() != null) {
            return userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }

        if (request.attendee() == null || request.attendee().email() == null) {
            throw new BadRequestException("Either userId or attendee details are required");
        }

        return userRepository.findByEmailIgnoreCase(request.attendee().email())
                .orElseGet(() -> {
                    String fullName = (request.attendee().firstName() + " " + request.attendee().lastName()).trim();
                    User attendeeUser = User.builder()
                            .fullName(fullName)
                            .email(request.attendee().email())
                            .password(passwordEncoder.encode("attendee-" + UUID.randomUUID()))
                            .authProvider(AuthProvider.LOCAL)
                            .emailVerified(true)
                            .failedLoginAttempts(0)
                            .lockedUntil(null)
                            .role(UserRole.ATTENDEE)
                            .createdAt(Instant.now())
                            .build();
                    return userRepository.save(attendeeUser);
                });
    }
}
