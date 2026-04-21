package com.eventify.platform.service.impl;

import com.eventify.platform.dto.auth.AuthResponse;
import com.eventify.platform.entity.AuthProvider;
import com.eventify.platform.entity.RefreshToken;
import com.eventify.platform.entity.User;
import com.eventify.platform.entity.UserRole;
import com.eventify.platform.repository.RefreshTokenRepository;
import com.eventify.platform.repository.UserRepository;
import com.eventify.platform.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OAuth2LoginServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private OAuth2LoginService service;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "refreshTokenExpirationSeconds", 1209600L);
    }

    @Test
    void handleOAuthLogin_repairsExistingLocalUserWithoutCrashing() {
        User existing = User.builder()
                .id(7L)
                .fullName("Legacy Local User")
                .email("alice@example.com")
                .password("hashed-password")
                .authProvider(AuthProvider.LOCAL)
                .emailVerified(false)
                .failedLoginAttempts(null)
                .lockedUntil(Instant.now().plusSeconds(600))
                .role(null)
                .createdAt(null)
                .build();

        OAuth2User oauth2User = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of(
                        "email", "alice@example.com",
                        "name", "Alice Example",
                        "picture", "https://cdn.example.com/alice.png",
                        "email_verified", true,
                        "sub", "google-123"
                ),
                "email"
        );

        when(userRepository.findByEmailIgnoreCase("alice@example.com")).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(refreshTokenRepository.findAllByUserAndRevokedFalse(existing)).thenReturn(List.of());
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateAccessToken(any(), anyMap())).thenReturn("jwt-token");
        when(jwtService.getAccessTokenExpirationSeconds()).thenReturn(900L);

        AuthResponse response = service.handleOAuthLogin(oauth2User, "google", UserRole.ORGANIZER);

        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.isEmailVerified()).isTrue();
        assertThat(saved.getAuthProvider()).isEqualTo(AuthProvider.LOCAL);
        assertThat(saved.getRole()).isEqualTo(UserRole.ATTENDEE);
        assertThat(saved.getFullName()).isEqualTo("Alice Example");
        assertThat(saved.getPictureUrl()).isEqualTo("https://cdn.example.com/alice.png");
        assertThat(saved.getFailedLoginAttempts()).isZero();
        assertThat(saved.getLockedUntil()).isNull();
        assertThat(saved.getCreatedAt()).isNotNull();

        assertThat(response.email()).isEqualTo("alice@example.com");
        assertThat(response.role()).isEqualTo(UserRole.ATTENDEE);
        assertThat(response.accessToken()).isEqualTo("jwt-token");
    }
}
