package com.eventify.platform.service.impl;

import com.eventify.platform.dto.payment.RazorpayVerifyRequest;
import com.eventify.platform.dto.registration.RegistrationRequest;
import com.eventify.platform.entity.Event;
import com.eventify.platform.entity.Registration;
import com.eventify.platform.entity.User;
import com.eventify.platform.exception.BadRequestException;
import com.eventify.platform.repository.EventRepository;
import com.eventify.platform.repository.RegistrationRepository;
import com.eventify.platform.repository.UserRepository;
import com.eventify.platform.service.EmailService;
import com.eventify.platform.service.RazorpayPaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceImplPaymentTest {
    @Mock private RegistrationRepository registrationRepository;
    @Mock private EventRepository eventRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;
    @Mock private RazorpayPaymentService razorpayPaymentService;
    @InjectMocks private RegistrationServiceImpl service;

    private Event event;
    private User user;

    @BeforeEach
    void setUp() {
        event = new Event();
        event.setId(1L);
        event.setTitle("Test Event");
        event.setDescription("Test description");
        event.setVenue("Test venue");
        event.setEventDate(LocalDate.of(2027, 1, 1));
        event.setEventTime(LocalTime.of(10, 0));
        event.setTicketPrice(new BigDecimal("100.00"));
        event.setTotalSeats(10);
        event.setSeatsLeft(10);

        user = new User();
        user.setId(2L);
        user.setEmail("attendee@example.test");
        user.setFullName("Test Attendee");
    }

    @Test
    void paidRegistrationRejectsMissingPaymentProofBeforePersistence() {
        when(eventRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(event));
        RegistrationRequest request = new RegistrationRequest(1L, 2L, 2, null, 2, null, null, null);

        assertThrows(BadRequestException.class, () -> service.register(request));

        verify(eventRepository, never()).save(any(Event.class));
        verify(registrationRepository, never()).save(any(Registration.class));
        verify(razorpayPaymentService, never()).verifyPaymentForRegistration(
                any(), anyLong(), anyInt(), anyString(), anyInt());
    }

    @Test
    void paidRegistrationVerifiesAmountAndSignatureBeforeSaving() {
        when(eventRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(event));
        when(registrationRepository.existsByPaymentId("pay_test")).thenReturn(false);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(registrationRepository.save(any(Registration.class))).thenAnswer(invocation -> {
            Registration registration = invocation.getArgument(0);
            registration.setId(123L);
            return registration;
        });

        RegistrationRequest request = new RegistrationRequest(
                1L, 2L, 2, null, 2, "pay_test", "order_test", "signature_test");

        service.register(request);

        InOrder order = inOrder(razorpayPaymentService, eventRepository, registrationRepository);
        order.verify(razorpayPaymentService).verifyPaymentForRegistration(
                eq(new RazorpayVerifyRequest("order_test", "pay_test", "signature_test")),
                eq(1L), eq(2), eq("attendee@example.test"), eq(20000));
        order.verify(eventRepository).save(event);
        order.verify(registrationRepository).save(any(Registration.class));
        assertEquals(8, event.getSeatsLeft());
    }

    @Test
    void reusedPaymentIdIsRejected() {
        when(eventRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(event));
        when(registrationRepository.existsByPaymentId("pay_test")).thenReturn(true);
        RegistrationRequest request = new RegistrationRequest(
                1L, 2L, 1, null, 1, "pay_test", "order_test", "signature_test");

        assertThrows(BadRequestException.class, () -> service.register(request));

        verify(razorpayPaymentService, never()).verifyPaymentForRegistration(
                any(), anyLong(), anyInt(), anyString(), anyInt());
        verify(registrationRepository, never()).save(any(Registration.class));
    }
}
