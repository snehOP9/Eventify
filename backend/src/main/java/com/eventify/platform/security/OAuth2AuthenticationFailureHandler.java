package com.eventify.platform.security;

import com.eventify.platform.logging.LogSanitizer;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    private final AuthCookieService authCookieService;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/auth/callback}")
    private String frontendRedirectUri;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {
        OAuth2Error oauth2Error = extractOAuth2Error(exception);
        String errorCode = resolveErrorCode(oauth2Error);
        String provider = resolveRegistrationId(request);
        String message = sanitizeErrorDescription(oauth2Error != null ? oauth2Error.getDescription() : null);
        log.warn("OAuth authentication failed provider={} errorCode={} message={}", provider, errorCode, message);

        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendRedirectUri)
                .queryParam("oauth", "error")
                .queryParam("error", errorCode)
                .queryParamIfPresent("provider", Optional.ofNullable(provider))
                .queryParamIfPresent("message", Optional.ofNullable(message))
                .build()
                .encode()
                .toUriString();

        response.addHeader("Set-Cookie", authCookieService.clearOauthPortalBridgeCookie().toString());
        response.sendRedirect(redirectUrl);
    }

    private OAuth2Error extractOAuth2Error(AuthenticationException exception) {
        if (exception instanceof OAuth2AuthenticationException oauth2AuthenticationException) {
            return oauth2AuthenticationException.getError();
        }

        return null;
    }

    private String resolveErrorCode(OAuth2Error oauth2Error) {
        if (oauth2Error == null || oauth2Error.getErrorCode() == null || oauth2Error.getErrorCode().isBlank()) {
            return "oauth2_authentication_failed";
        }

        return oauth2Error.getErrorCode();
    }

    private String resolveRegistrationId(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        if (requestUri == null || requestUri.isBlank()) {
            return null;
        }

        String marker = "/login/oauth2/code/";
        int markerIndex = requestUri.indexOf(marker);
        if (markerIndex < 0) {
            return null;
        }

        String registrationId = requestUri.substring(markerIndex + marker.length());
        int slashIndex = registrationId.indexOf('/');
        if (slashIndex >= 0) {
            registrationId = registrationId.substring(0, slashIndex);
        }

        return registrationId.isBlank() ? null : registrationId;
    }

    private String sanitizeErrorDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }

        String normalized = description.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= 160) {
            return normalized;
        }

        return normalized.substring(0, 160);
    }
}
