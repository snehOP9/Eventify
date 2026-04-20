package com.eventify.platform.service.impl;

import com.eventify.platform.exception.EmailDeliveryException;
import com.eventify.platform.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@ConditionalOnProperty(prefix = "app.mail", name = "enabled", havingValue = "false", matchIfMissing = true)
public class ConsoleEmailService implements EmailService {

    @Value("${RAILWAY_ENVIRONMENT:}")
    private String railwayEnvironment;

    @Override
    public void sendOtpEmail(String to, String subject, String otp, String context) {
        failIfHostedEnvironment();
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
            failIfHostedEnvironment();
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

    private void failIfHostedEnvironment() {
        if (railwayEnvironment != null && !railwayEnvironment.isBlank()) {
            log.error("ConsoleEmailService is active in hosted environment. Configure SMTP and set APP_MAIL_ENABLED=true.");
            throw new EmailDeliveryException("OTP email service is not configured. Please contact support.");
        }
    }
}
