package com.eventify.platform.security;

import com.eventify.platform.entity.UserRole;
import com.eventify.platform.service.impl.OAuth2LoginService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseCookie;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OAuth2AuthenticationSuccessHandlerTest {

    @Mock
    private OAuth2LoginService oauth2LoginService;

    @Mock
    private OAuthLoginCodeService oauthLoginCodeService;

    @Mock
    private AuthCookieService authCookieService;

    @InjectMocks
    private OAuth2AuthenticationSuccessHandler handler;

    @Test
    void onAuthenticationSuccess_redirectsToFrontendErrorWhenPostLoginProcessingFails() throws Exception {
        ReflectionTestUtils.setField(handler, "frontendRedirectUri", "https://eventify-live-snehop9.vercel.app/auth/callback");

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/login/oauth2/code/google");
        request.setCookies(new Cookie(AuthCookieService.OAUTH_PORTAL_BRIDGE_COOKIE_NAME, "organizer"));
        MockHttpServletResponse response = new MockHttpServletResponse();

        OAuth2User oauth2User = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of(
                        "email", "alice@example.com",
                        "name", "Alice Example",
                        "email_verified", true,
                        "sub", "google-123"
                ),
                "email"
        );
        OAuth2AuthenticationToken authentication = new OAuth2AuthenticationToken(
                oauth2User,
                oauth2User.getAuthorities(),
                "google"
        );

        when(oauth2LoginService.handleOAuthLogin(oauth2User, "google", UserRole.ORGANIZER))
                .thenThrow(new IllegalStateException("Unable to finish sign in right now"));
        when(authCookieService.clearRefreshTokenCookie())
                .thenReturn(ResponseCookie.from(AuthCookieService.REFRESH_COOKIE_NAME, "").path("/").maxAge(0).build());
        when(authCookieService.clearOauthCodeCookie())
                .thenReturn(ResponseCookie.from(AuthCookieService.OAUTH_CODE_COOKIE_NAME, "").path("/").maxAge(0).build());
        when(authCookieService.clearOauthPortalBridgeCookie())
                .thenReturn(ResponseCookie.from(AuthCookieService.OAUTH_PORTAL_BRIDGE_COOKIE_NAME, "").path("/").maxAge(0).build());

        handler.onAuthenticationSuccess(request, response, authentication);

        assertThat(response.getStatus()).isEqualTo(302);
        assertThat(response.getRedirectedUrl())
                .contains("https://eventify-live-snehop9.vercel.app/auth/callback")
                .contains("oauth=error")
                .contains("provider=google")
                .contains("message=Unable%20to%20finish%20sign%20in%20right%20now");
        assertThat(response.getHeaders("Set-Cookie")).hasSize(3);
        verify(oauthLoginCodeService, never()).issueCode(org.mockito.ArgumentMatchers.anyString());
    }
}
