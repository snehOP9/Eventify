package com.eventify.platform.service;

public interface EmailService {
    void sendOtpEmail(String to, String subject, String otp, String context);

    void sendRegistrationConfirmation(
            String to,
            String attendeeName,
            String eventTitle,
            String eventDate,
            String eventTime,
            String venue,
            int ticketCount,
            String paymentId,
            String confirmationCode
    );
}
