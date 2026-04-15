package com.eventify.platform.controller;

import com.eventify.platform.dto.auth.AuthResponse;
import com.eventify.platform.security.AuthCookieService;
import com.eventify.platform.security.OAuthLoginCodeService;
import com.eventify.platform.service.impl.OAuth2LoginService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/oauth2")
@RequiredArgsConstructor
public class OAuth2AuthController {

    private final OAuthLoginCodeService oAuthLoginCodeService;
    private final OAuth2LoginService oAuth2LoginService;
    private final AuthCookieService authCookieService;

    @Value("${app.auth.refresh-token-expiration-seconds:1209600}")
    private long refreshTokenExpirationSeconds;

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
            return ResponseEntity.status(401).build();
        }

        response.addHeader("Set-Cookie", authCookieService.clearOauthCodeCookie().toString());
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
            return ResponseEntity.ok(authResponse);
        } catch (IllegalStateException ex) {
            response.addHeader("Set-Cookie", authCookieService.clearRefreshTokenCookie().toString());
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
}
