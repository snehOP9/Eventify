package com.eventify.platform.controller;

import com.eventify.platform.dto.auth.AuthResponse;
import com.eventify.platform.logging.LogSanitizer;
import com.eventify.platform.security.AuthCookieService;
import com.eventify.platform.security.OAuthLoginCodeService;
import com.eventify.platform.service.impl.OAuth2LoginService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth/oauth2")
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthController {

    private static final Set<String> SUPPORTED_PROVIDERS = Set.of("google", "github");

    private final OAuthLoginCodeService oAuthLoginCodeService;
    private final OAuth2LoginService oAuth2LoginService;
    private final AuthCookieService authCookieService;

    @Value("${app.auth.refresh-token-expiration-seconds:1209600}")
    private long refreshTokenExpirationSeconds;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.github.client-id:}")
    private String githubClientId;

    @Value("${app.oauth2.portal-cookie-ttl-seconds:600}")
    private long portalCookieTtlSeconds;

    @Value("${app.oauth2.backend-callback-base-url:http://localhost:8080}")
    private String backendCallbackBaseUrl;

    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> ready() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "googleEnabled", isProviderConfigured(googleClientId),
                "githubEnabled", isProviderConfigured(githubClientId)
        ));
    }

    @GetMapping("/authorization/{registrationId}")
    public ResponseEntity<Void> beginAuthorization(
            HttpServletRequest request,
            @PathVariable String registrationId,
            @RequestParam(value = "portal", required = false) String portal,
            @RequestParam(value = "handoff", defaultValue = "0") int handoff
    ) {
        String normalizedRegistrationId = registrationId == null ? "" : registrationId.trim().toLowerCase();
        if (!SUPPORTED_PROVIDERS.contains(normalizedRegistrationId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (shouldHandoffToBackend(request, handoff)) {
            log.info(
                    "OAuth authorization handoff provider={} portal={} requestOrigin={} backendBaseUrl={}",
                    normalizedRegistrationId,
                    normalizePortal(portal),
                    resolveRequestOrigin(request),
                    normalizeOrigin(backendCallbackBaseUrl)
            );
            URI backendRedirectUri = UriComponentsBuilder
                    .fromUriString(normalizeOrigin(backendCallbackBaseUrl))
                    .path("/api/auth/oauth2/authorization/{registrationId}")
                    .queryParam("portal", normalizePortal(portal))
                    .queryParam("handoff", 1)
                    .buildAndExpand(normalizedRegistrationId)
                    .encode()
                    .toUri();

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(backendRedirectUri)
                    .build();
        }
        log.info(
                "OAuth authorization started provider={} portal={} requestOrigin={}",
                normalizedRegistrationId,
                normalizePortal(portal),
                resolveRequestOrigin(request)
        );

        URI redirectUri = UriComponentsBuilder
                .fromPath("/api/oauth2/authorization/{registrationId}")
                .buildAndExpand(normalizedRegistrationId)
                .toUri();

        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Set-Cookie", authCookieService.oauthPortalBridgeCookie(portal, portalCookieTtlSeconds).toString())
                .location(redirectUri)
                .build();
    }

    private boolean shouldHandoffToBackend(HttpServletRequest request, int handoff) {
        if (handoff > 0) {
            return false;
        }

        String currentOrigin = resolveRequestOrigin(request);
        return currentOrigin != null
                && !currentOrigin.isBlank()
                && !normalizeOrigin(backendCallbackBaseUrl).equalsIgnoreCase(normalizeOrigin(currentOrigin));
    }

    private String resolveRequestOrigin(HttpServletRequest request) {
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        String forwardedHost = request.getHeader("X-Forwarded-Host");

        String scheme = (forwardedProto != null && !forwardedProto.isBlank())
                ? forwardedProto.split(",")[0].trim()
                : request.getScheme();
        String host = (forwardedHost != null && !forwardedHost.isBlank())
                ? forwardedHost.split(",")[0].trim()
                : request.getHeader("Host");

        if (host == null || host.isBlank()) {
            return null;
        }

        return normalizeOrigin(scheme + "://" + host);
    }

    private String normalizePortal(String portal) {
        return "organizer".equalsIgnoreCase(portal) ? "organizer" : "attendee";
    }

    private String normalizeOrigin(String value) {
        if (value == null) {
            return "";
        }

        return value.trim().replaceAll("/+$", "");
    }

    @PostMapping("/exchange")
    public ResponseEntity<AuthResponse> exchange(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestParam(value = "code", required = false) String requestCode
    ) {
        String code = (requestCode != null && !requestCode.isBlank())
                ? requestCode
                : getCookieValue(request, AuthCookieService.OAUTH_CODE_COOKIE_NAME);
        String email = oAuthLoginCodeService.consumeCode(code);
        if (email == null) {
            log.warn("OAuth code exchange failed reason=invalid_or_expired_code");
            return ResponseEntity.status(401).build();
        }

        response.addHeader("Set-Cookie", authCookieService.clearOauthCodeCookie().toString());
        log.info("OAuth code exchange succeeded email={}", LogSanitizer.maskEmail(email));
        return ResponseEntity.ok(oAuth2LoginService.exchangeFromOneTimeCode(email));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = getCookieValue(request, AuthCookieService.REFRESH_COOKIE_NAME);
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).build();
        }

        try {
            AuthResponse authResponse = oAuth2LoginService.rotateRefreshToken(refreshToken);
            response.addHeader(
                    "Set-Cookie",
                    authCookieService.refreshTokenCookie(authResponse.refreshToken(), refreshTokenExpirationSeconds).toString()
            );
            log.info("OAuth refresh succeeded userId={}", authResponse.userId());
            return ResponseEntity.ok(authResponse);
        } catch (IllegalStateException ex) {
            response.addHeader("Set-Cookie", authCookieService.clearRefreshTokenCookie().toString());
            log.warn("OAuth refresh failed error={}", LogSanitizer.safeExceptionMessage(ex));
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = getCookieValue(request, AuthCookieService.REFRESH_COOKIE_NAME);
        if (refreshToken != null && !refreshToken.isBlank()) {
            oAuth2LoginService.revokeRefreshToken(refreshToken);
        }
        response.addHeader("Set-Cookie", authCookieService.clearRefreshTokenCookie().toString());
        response.addHeader("Set-Cookie", authCookieService.clearOauthCodeCookie().toString());
        log.info("OAuth logout completed");
        return ResponseEntity.noContent().build();
    }

    private String getCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }

    private boolean isProviderConfigured(String clientId) {
        return clientId != null
                && !clientId.isBlank()
                && !clientId.toLowerCase().startsWith("dummy-");
    }
}
