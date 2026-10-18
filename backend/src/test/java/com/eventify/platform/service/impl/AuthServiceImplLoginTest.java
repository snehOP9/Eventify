package com.eventify.platform.service.impl;

import com.eventify.platform.dto.auth.LoginRequest;
import com.eventify.platform.entity.User;
import com.eventify.platform.entity.UserRole;
import com.eventify.platform.exception.BadRequestException;
import com.eventify.platform.repository.OtpCodeRepository;
import com.eventify.platform.repository.RefreshTokenRepository;
import com.eventify.platform.repository.UserRepository;
import com.eventify.platform.security.JwtService;
import com.eventify.platform.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplLoginTest {
    @Mock private UserRepository userRepository;
    @Mock private OtpCodeRepository otpCodeRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;
    @Mock private JwtService jwtService;
    @InjectMocks private AuthServiceImpl service;

    @Test
    void rejectedPasswordsPersistAttemptsAndEventuallyLockTheAccount() throws Exception {
        Transactional transaction = AuthServiceImpl.class
                .getMethod("login", LoginRequest.class)
                .getAnnotation(Transactional.class);
        assertThat(transaction).isNotNull();
        assertThat(transaction.noRollbackFor()).contains(BadRequestException.class);

        ReflectionTestUtils.setField(service, "maxFailedLoginAttempts", 5);
        ReflectionTestUtils.setField(service, "lockoutDurationSeconds", 900L);

        User user = User.builder()
                .id(1L)
                .email("lockout@example.com")
                .password("stored-hash")
                .role(UserRole.ATTENDEE)
                .emailVerified(true)
                .failedLoginAttempts(0)
                .createdAt(Instant.now())
                .build();
        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "stored-hash")).thenReturn(false);

        LoginRequest request = new LoginRequest(user.getEmail(), "wrong-password");
        for (int attempt = 1; attempt <= 5; attempt++) {
            assertThrows(BadRequestException.class, () -> service.login(request));
            if (attempt < 5) {
                assertThat(user.getFailedLoginAttempts()).isEqualTo(attempt);
                assertThat(user.getLockedUntil()).isNull();
            }
        }

        assertThat(user.getFailedLoginAttempts()).isZero();
        assertThat(user.getLockedUntil()).isAfter(Instant.now());
        assertThrows(BadRequestException.class, () -> service.login(request));
        verify(passwordEncoder, times(5)).matches("wrong-password", "stored-hash");
        verify(userRepository, times(5)).save(user);
    }
}
