package com.eventify.platform.service.impl;

import com.eventify.platform.dto.auth.SignupRequest;
import com.eventify.platform.entity.OtpCode;
import com.eventify.platform.entity.OtpPurpose;
import com.eventify.platform.entity.User;
import com.eventify.platform.entity.UserRole;
import com.eventify.platform.repository.OtpCodeRepository;
import com.eventify.platform.repository.RefreshTokenRepository;
import com.eventify.platform.repository.UserRepository;
import com.eventify.platform.security.JwtService;
import com.eventify.platform.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplOtpTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpCodeRepository otpCodeRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl service;

    @Test
    void signupIssuesSixDigitHashedVerificationOtp() {
        SignupRequest request = new SignupRequest(
                "Test User",
                "user@example.com",
                "password123",
                UserRole.ATTENDEE
        );

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenAnswer(invocation -> "hash:" + invocation.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(otpCodeRepository.findFirstByUserAndPurposeAndUsedFalseOrderByCreatedAtDesc(
                any(User.class), eq(OtpPurpose.EMAIL_VERIFICATION)
        )).thenReturn(Optional.empty());
        when(otpCodeRepository.findByUserAndPurposeAndUsedFalse(
                any(User.class), eq(OtpPurpose.EMAIL_VERIFICATION)
        )).thenReturn(List.of());

        service.signup(request);

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendOtpEmail(
                eq(request.email()),
                eq("Verify your email"),
                otpCaptor.capture(),
                eq("email-verification")
        );

        String otp = otpCaptor.getValue();
        assertThat(otp).matches("\\d{6}");

        ArgumentCaptor<OtpCode> codeCaptor = ArgumentCaptor.forClass(OtpCode.class);
        verify(otpCodeRepository).save(codeCaptor.capture());
        OtpCode saved = codeCaptor.getValue();

        assertThat(saved.getPurpose()).isEqualTo(OtpPurpose.EMAIL_VERIFICATION);
        assertThat(saved.getOtpHash()).isEqualTo("hash:" + otp);
        assertThat(saved.isUsed()).isFalse();
        assertThat(saved.getCreatedAt()).isBeforeOrEqualTo(Instant.now());
    }
}
