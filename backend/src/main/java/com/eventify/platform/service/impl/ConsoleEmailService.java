package com.eventify.platform.service.impl;

import com.eventify.platform.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@ConditionalOnProperty(prefix = "app.mail", name = "enabled", havingValue = "false", matchIfMissing = true)
public class ConsoleEmailService implements EmailService {

    @Override
    public void sendOtpEmail(String to, String subject, String otp, String context) {
        // Placeholder implementation for local development.
        log.info("OTP email simulated. to={}, subject={}, context={}, otp={}", to, subject, context, otp);
    }

    @Override
    public void sendRegistrationConfirmation(
            String to,
            String attendeeName,
            String eventTitle,
            String eventDate,
            String eventTime,
            String venue,
            int ticketCount,
            String paymentId,
            String confirmationCode
    ) {
        log.info(
                "Registration email simulated. to={}, attendee={}, event={}, date={}, time={}, venue={}, tickets={}, paymentId={}, confirmationCode={}",
                to,
                attendeeName,
                eventTitle,
                eventDate,
                eventTime,
                venue,
                ticketCount,
                paymentId,
                confirmationCode
        );
    }
}
