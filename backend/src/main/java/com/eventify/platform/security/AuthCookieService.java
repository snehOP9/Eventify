package com.eventify.platform.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class AuthCookieService {

    public static final String REFRESH_COOKIE_NAME = "refresh_token";
    public static final String OAUTH_CODE_COOKIE_NAME = "oauth_login_code";

    private final boolean secure;
    private final String sameSite;

    public AuthCookieService(
            @Value("${app.auth.cookies.secure:false}") boolean secure,
            @Value("${app.auth.cookies.same-site:None}") String sameSite
    ) {
        this.secure = secure;
        this.sameSite = sameSite;
    }

    public ResponseCookie refreshTokenCookie(String refreshToken, long maxAgeSeconds) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
    }

    public ResponseCookie clearRefreshTokenCookie() {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(0)
                .build();
    }

    public ResponseCookie oauthCodeCookie(String code, long maxAgeSeconds) {
        return ResponseCookie.from(OAUTH_CODE_COOKIE_NAME, code)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
    }

    public ResponseCookie clearOauthCodeCookie() {
        return ResponseCookie.from(OAUTH_CODE_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(0)
                .build();
    }
}
