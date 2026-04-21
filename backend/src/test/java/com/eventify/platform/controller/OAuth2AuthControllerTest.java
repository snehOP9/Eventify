package com.eventify.platform.controller;

import com.eventify.platform.security.AuthCookieService;
import com.eventify.platform.security.OAuthLoginCodeService;
import com.eventify.platform.service.impl.OAuth2LoginService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OAuth2AuthControllerTest {

    @Mock
    private OAuthLoginCodeService oAuthLoginCodeService;

    @Mock
    private OAuth2LoginService oAuth2LoginService;

    @Mock
    private AuthCookieService authCookieService;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private OAuth2AuthController controller;

    @Test
    void beginAuthorization_handoffsCrossOriginRequestsToBackendOrigin() {
        ReflectionTestUtils.setField(controller, "portalCookieTtlSeconds", 600L);
        ReflectionTestUtils.setField(controller, "backendCallbackBaseUrl", "https://event-platform-backend.onrender.com");
        when(request.getHeader("X-Forwarded-Proto")).thenReturn("https");
        when(request.getHeader("X-Forwarded-Host")).thenReturn("eventify-live-snehop9.vercel.app");

        var response = controller.beginAuthorization(request, "google", "organizer", 0);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FOUND);
        assertThat(response.getHeaders().getLocation()).hasToString(
                "https://event-platform-backend.onrender.com/api/auth/oauth2/authorization/google?portal=organizer&handoff=1"
        );
        verify(authCookieService, never()).oauthPortalBridgeCookie(eq("organizer"), anyLong());
    }

    @Test
    void beginAuthorization_rejectsUnknownProvider() {
        var response = controller.beginAuthorization(request, "linkedin", "attendee", 0);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(authCookieService, never()).oauthPortalBridgeCookie(eq("attendee"), anyLong());
    }

    @Test
    void beginAuthorization_setsBridgeCookieWhenAlreadyOnBackendOrigin() {
        ReflectionTestUtils.setField(controller, "portalCookieTtlSeconds", 600L);
        ReflectionTestUtils.setField(controller, "backendCallbackBaseUrl", "https://event-platform-backend.onrender.com");
        when(authCookieService.oauthPortalBridgeCookie(eq("organizer"), anyLong()))
                .thenReturn(org.springframework.http.ResponseCookie.from("eventify_oauth_portal_bridge", "organizer").build());

        var response = controller.beginAuthorization(request, "google", "organizer", 1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FOUND);
        assertThat(response.getHeaders().getLocation()).hasToString("/api/oauth2/authorization/google");
        assertThat(response.getHeaders().getFirst("Set-Cookie"))
                .contains("eventify_oauth_portal_bridge=organizer");
        verify(authCookieService).oauthPortalBridgeCookie("organizer", 600L);
    }
}
