package com.eventify.platform.security;

import com.eventify.platform.dto.auth.AuthResponse;
import com.eventify.platform.service.impl.OAuth2LoginService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
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
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof OAuth2User oauth2User)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid OAuth2 principal");
            return;
        }

        AuthResponse authResponse = oauth2LoginService.handleGoogleLogin(oauth2User);
        String oneTimeCode = oauthLoginCodeService.issueCode(authResponse.email());

        var refreshCookie = authCookieService.refreshTokenCookie(authResponse.refreshToken(), refreshTokenExpirationSeconds);
        response.addHeader("Set-Cookie", refreshCookie.toString());
        var oauthCodeCookie = authCookieService.oauthCodeCookie(oneTimeCode, oauthCodeTtlSeconds);
        response.addHeader("Set-Cookie", oauthCodeCookie.toString());

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
            .queryParam("oauth", "success")
                .queryParam("code", oneTimeCode)
                .build(true)
                .toUriString();

        response.sendRedirect(redirectUrl);
    }
}
