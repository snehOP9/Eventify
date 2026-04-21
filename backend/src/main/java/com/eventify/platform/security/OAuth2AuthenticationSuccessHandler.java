package com.eventify.platform.security;

import com.eventify.platform.dto.auth.AuthResponse;
import com.eventify.platform.entity.UserRole;
import com.eventify.platform.service.impl.OAuth2LoginService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final OAuth2LoginService oauth2LoginService;
    private final OAuthLoginCodeService oauthLoginCodeService;
    private final AuthCookieService authCookieService;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/auth/callback}")
    private String frontendRedirectUri;

    @Value("${app.auth.refresh-token-expiration-seconds:1209600}")
    private long refreshTokenExpirationSeconds;

    @Value("${app.oauth2.code-ttl-seconds:90}")
    private long oauthCodeTtlSeconds;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        if (!(authentication instanceof OAuth2AuthenticationToken oauth2AuthenticationToken)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid OAuth2 authentication token");
            return;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof OAuth2User oauth2User)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid OAuth2 principal");
            return;
        }

        String registrationId = oauth2AuthenticationToken.getAuthorizedClientRegistrationId();
        UserRole requestedRole = resolveRequestedRole(request);

        try {
            AuthResponse authResponse = oauth2LoginService.handleOAuthLogin(oauth2User, registrationId, requestedRole);
            log.info(
                    "OAuth authentication succeeded provider={} userId={} role={}",
                    registrationId,
                    authResponse.userId(),
                    authResponse.role()
            );
            String oneTimeCode = oauthLoginCodeService.issueCode(authResponse.email());

            var refreshCookie = authCookieService.refreshTokenCookie(authResponse.refreshToken(), refreshTokenExpirationSeconds);
            response.addHeader("Set-Cookie", refreshCookie.toString());
            var oauthCodeCookie = authCookieService.oauthCodeCookie(oneTimeCode, oauthCodeTtlSeconds);
            response.addHeader("Set-Cookie", oauthCodeCookie.toString());
            response.addHeader("Set-Cookie", authCookieService.clearOauthPortalBridgeCookie().toString());

            String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                    .queryParam("oauth", "success")
                    .queryParam("code", oneTimeCode)
                    .build()
                    .encode()
                    .toUriString();

            response.sendRedirect(redirectUrl);
        } catch (RuntimeException ex) {
            log.warn("OAuth success flow failed for provider {}: {}", registrationId, ex.getMessage(), ex);
            response.addHeader("Set-Cookie", authCookieService.clearRefreshTokenCookie().toString());
            response.addHeader("Set-Cookie", authCookieService.clearOauthCodeCookie().toString());
            response.addHeader("Set-Cookie", authCookieService.clearOauthPortalBridgeCookie().toString());

            String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                    .queryParam("oauth", "error")
                    .queryParam("error", "oauth2_authentication_failed")
                    .queryParamIfPresent("provider", Optional.ofNullable(registrationId))
                    .queryParamIfPresent("message", Optional.ofNullable(sanitizeErrorMessage(ex)))
                    .build()
                    .encode()
                    .toUriString();

            response.sendRedirect(redirectUrl);
        }
    }

    private UserRole resolveRequestedRole(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return UserRole.ATTENDEE;
        }

        for (Cookie cookie : cookies) {
            if (!AuthCookieService.OAUTH_PORTAL_BRIDGE_COOKIE_NAME.equals(cookie.getName())) {
                continue;
            }

            if ("organizer".equalsIgnoreCase(cookie.getValue())) {
                return UserRole.ORGANIZER;
            }

            return UserRole.ATTENDEE;
        }

        return UserRole.ATTENDEE;
    }

    private String sanitizeErrorMessage(RuntimeException exception) {
        if (exception == null) {
            return null;
        }

        if (!(exception instanceof IllegalStateException)) {
            return null;
        }

        String message = exception.getMessage();
        if (message == null || message.isBlank()) {
            return null;
        }

        String normalized = message.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= 160) {
            return normalized;
        }

        return normalized.substring(0, 160);
    }
}
