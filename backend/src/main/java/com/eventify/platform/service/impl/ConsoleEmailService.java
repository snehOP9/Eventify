package com.eventify.platform.service.impl;

import com.eventify.platform.exception.EmailDeliveryException;
import com.eventify.platform.logging.LogSanitizer;
import com.eventify.platform.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@ConditionalOnProperty(prefix = "app.mail", name = "enabled", havingValue = "false", matchIfMissing = true)
public class ConsoleEmailService implements EmailService {

    @Value("${app.runtime-environment:development}")
    private String runtimeEnvironment;

    @Override
    public void sendOtpEmail(String to, String subject, String otp, String context) {
        failIfHostedEnvironment();
        log.info(
                "Email delivery simulated provider=console recipient={} subject={} context={}",
                LogSanitizer.maskEmail(to),
                subject,
                context
        );
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
                "Registration email simulated provider=console recipient={} attendee={} event={} date={} time={} venue={} tickets={} paymentId={} confirmationCode={}",
                LogSanitizer.maskEmail(to),
                LogSanitizer.truncate(attendeeName, 40),
                eventTitle,
                eventDate,
                eventTime,
                venue,
                ticketCount,
                LogSanitizer.maskIdentifier(paymentId),
                LogSanitizer.maskIdentifier(confirmationCode)
        );
    }

    private void failIfHostedEnvironment() {
        if ("production".equalsIgnoreCase(runtimeEnvironment)) {
            log.error("ConsoleEmailService is active in hosted environment. Configure SMTP and set APP_MAIL_ENABLED=true.");
            throw new EmailDeliveryException("OTP email service is not configured. Please contact support.");
        }
    }
}
