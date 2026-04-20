package com.eventify.platform.service.impl;

import com.eventify.platform.exception.EmailDeliveryException;
import com.eventify.platform.service.EmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnExpression("'${app.mail.enabled:false}' == 'true' and '${app.mail.provider:smtp}' == 'resend'")
public class ResendEmailService implements EmailService {

    private static final String DELIVERY_ERROR_MESSAGE = "Unable to send OTP email right now. Please try again shortly.";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${app.mail.from:no-reply@eventify.local}")
    private String fromAddress;

    @Value("${app.mail.resend.api-key:}")
    private String apiKey;

    @Value("${app.mail.resend.endpoint:https://api.resend.com/emails}")
    private String endpoint;

    @Value("${app.mail.resend.testing-recipient:}")
    private String testingRecipient;

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
        validateConfiguration();
        if (to == null || to.isBlank()) {
            throw new EmailDeliveryException("Recipient email address is missing.");
        }

        String resolvedRecipient = resolveRecipient(to);
        String resolvedBody = body;
        if (!resolvedRecipient.equals(to)) {
            log.warn("Resend testing recipient override is active. requestedTo={}, redirectedTo={}", to, resolvedRecipient);
            resolvedBody = String.format("Originally requested recipient: %s%n%n%s", to, body);
        }

        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "from", fromAddress,
                    "to", List.of(resolvedRecipient),
                    "subject", subject,
                    "text", resolvedBody
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.error("Resend API failed. status={}, response={}", response.statusCode(), response.body());
                throw new EmailDeliveryException(DELIVERY_ERROR_MESSAGE);
            }
        } catch (EmailDeliveryException exception) {
            throw exception;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new EmailDeliveryException(DELIVERY_ERROR_MESSAGE, exception);
        } catch (Exception exception) {
            log.error("Failed to send Resend email to {}", to, exception);
            throw new EmailDeliveryException(DELIVERY_ERROR_MESSAGE, exception);
        }
    }

    private String resolveRecipient(String requestedRecipient) {
        if (testingRecipient == null || testingRecipient.isBlank()) {
            return requestedRecipient;
        }
        return testingRecipient;
    }

    private void validateConfiguration() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new EmailDeliveryException("OTP email service is not configured. Please contact support.");
        }

        if (fromAddress == null || fromAddress.isBlank()) {
            throw new EmailDeliveryException("OTP email sender address is not configured. Please contact support.");
        }

        if (endpoint == null || endpoint.isBlank()) {
            throw new EmailDeliveryException("OTP email service endpoint is not configured. Please contact support.");
        }
    }
}
