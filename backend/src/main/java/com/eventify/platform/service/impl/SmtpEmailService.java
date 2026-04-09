package com.eventify.platform.service.impl;

import com.eventify.platform.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.mail", name = "enabled", havingValue = "true")
public class SmtpEmailService implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@eventify.local}")
    private String fromAddress;

    @Override
    public void sendOtpEmail(String to, String subject, String otp, String context) {
        String body = String.format(
                "Hello,%n%nYour Eventify OTP for %s is: %s%n%nThis OTP is valid for a limited time.%n%nRegards,%nEventify Team",
                context,
                otp
        );
        sendMail(to, subject, body);
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
        String subject = "Your Eventify registration is confirmed";
        String body = String.format(
                "Dear %s,%n%n" +
                        "Thank you for registering with Eventify.%n%n" +
                        "Registration Details:%n" +
                        "- Event: %s%n" +
                        "- Date: %s%n" +
                        "- Time: %s%n" +
                        "- Venue: %s%n" +
                        "- Tickets: %d%n" +
                        "- Payment ID: %s%n" +
                        "- Confirmation Code: %s%n%n" +
                        "Please keep this email for your records. We look forward to seeing you at the event.%n%n" +
                        "Warm regards,%n" +
                        "Eventify Team",
                attendeeName,
                eventTitle,
                eventDate,
                eventTime,
                venue,
                ticketCount,
                paymentId,
                confirmationCode
        );
        sendMail(to, subject, body);
    }

    private void sendMail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception exception) {
            log.error("Failed to send SMTP email to {}", to, exception);
        }
    }
}
