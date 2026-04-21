package com.eventify.platform.logging;

import jakarta.servlet.http.HttpServletRequest;

import java.net.URI;
import java.util.Locale;

public final class LogSanitizer {

    private LogSanitizer() {
    }

    public static String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "n/a";
        }

        String trimmed = email.trim();
        int atIndex = trimmed.indexOf('@');
        if (atIndex <= 0 || atIndex == trimmed.length() - 1) {
            return maskIdentifier(trimmed);
        }

        String localPart = trimmed.substring(0, atIndex);
        String domainPart = trimmed.substring(atIndex + 1).toLowerCase(Locale.ROOT);
        String maskedLocalPart = localPart.length() <= 2
                ? localPart.charAt(0) + "***"
                : localPart.charAt(0) + "***" + localPart.charAt(localPart.length() - 1);

        return maskedLocalPart + "@" + domainPart;
    }

    public static String maskIdentifier(String value) {
        if (value == null || value.isBlank()) {
            return "n/a";
        }

        String trimmed = value.trim();
        if (trimmed.length() <= 4) {
            return "****";
        }

        return trimmed.substring(0, 2) + "***" + trimmed.substring(Math.max(trimmed.length() - 4, 2));
    }

    public static String safeExceptionMessage(Throwable throwable) {
        if (throwable == null) {
            return "Unknown error";
        }

        String message = throwable.getMessage();
        if (message == null || message.isBlank()) {
            return throwable.getClass().getSimpleName();
        }

        return truncate(message.replaceAll("\\s+", " ").trim(), 160);
    }

    public static String safePath(HttpServletRequest request) {
        if (request == null || request.getRequestURI() == null || request.getRequestURI().isBlank()) {
            return "/";
        }

        return request.getRequestURI();
    }

    public static String originOf(String uriValue) {
        if (uriValue == null || uriValue.isBlank()) {
            return "";
        }

        try {
            URI uri = URI.create(uriValue.trim());
            if (uri.getScheme() == null || uri.getHost() == null) {
                return "";
            }

            String port = uri.getPort() > 0 ? ":" + uri.getPort() : "";
            return uri.getScheme() + "://" + uri.getHost() + port;
        } catch (Exception exception) {
            return "";
        }
    }

    public static String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }

        if (value.length() <= maxLength) {
            return value;
        }

        return value.substring(0, maxLength);
    }
}
