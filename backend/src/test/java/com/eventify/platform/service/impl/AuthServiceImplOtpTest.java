package com.eventify.platform.service.impl;

import com.eventify.platform.dto.auth.EmailRequest;
import com.eventify.platform.dto.auth.SignupRequest;
import com.eventify.platform.dto.auth.VerifyOtpRequest;
import com.eventify.platform.exception.BadRequestException;
import com.eventify.platform.entity.OtpCode;
import com.eventify.platform.entity.OtpPurpose;
import com.eventify.platform.entity.User;
import com.eventify.platform.entity.UserRole;
import com.eventify.platform.repository.OtpCodeRepository;
import com.eventify.platform.repository.RefreshTokenRepository;
import com.eventify.platform.repository.UserRepository;
import com.eventify.platform.security.JwtService;
import com.eventify.platform.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.junit.jupiter.api.Assertions.assertThrows;
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

    @BeforeEach
    void configureOtpAttemptLimit() {
        ReflectionTestUtils.setField(service, "maxFailedOtpAttempts", 5);
    }

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
    @Test
    void passwordResetIssuesSixDigitHashedOtp() {
        User user = User.builder()
                .id(2L)
                .fullName("Reset User")
                .email("reset@example.com")
                .password("stored-hash")
                .role(UserRole.ATTENDEE)
                .emailVerified(true)
                .createdAt(Instant.now())
                .build();

        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(anyString())).thenAnswer(invocation -> "hash:" + invocation.getArgument(0));
        when(otpCodeRepository.findFirstByUserAndPurposeAndUsedFalseOrderByCreatedAtDesc(
                user, OtpPurpose.PASSWORD_RESET
        )).thenReturn(Optional.empty());
        when(otpCodeRepository.findByUserAndPurposeAndUsedFalse(
                user, OtpPurpose.PASSWORD_RESET
        )).thenReturn(List.of());

        service.requestPasswordReset(new EmailRequest(user.getEmail()));

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendOtpEmail(
                eq(user.getEmail()),
                eq("Reset your password"),
                otpCaptor.capture(),
                eq("password-reset")
        );

        String otp = otpCaptor.getValue();
        assertThat(otp).matches("\\d{6}");

        ArgumentCaptor<OtpCode> codeCaptor = ArgumentCaptor.forClass(OtpCode.class);
        verify(otpCodeRepository).save(codeCaptor.capture());
        OtpCode saved = codeCaptor.getValue();

        assertThat(saved.getPurpose()).isEqualTo(OtpPurpose.PASSWORD_RESET);
        assertThat(saved.getOtpHash()).isEqualTo("hash:" + otp);
        assertThat(saved.isUsed()).isFalse();
    }

    @Test
    void repeatedWrongOtpGuessesInvalidateTheCode() {
        User user = User.builder()
                .id(3L)
                .fullName("OTP User")
                .email("otp@example.com")
                .password("stored-hash")
                .role(UserRole.ATTENDEE)
                .emailVerified(false)
                .createdAt(Instant.now())
                .build();
        OtpCode otp = OtpCode.builder()
                .id(30L)
                .user(user)
                .purpose(OtpPurpose.EMAIL_VERIFICATION)
                .otpHash("otp-hash")
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(600))
                .used(false)
                .failedAttempts(0)
                .build();
        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
        when(otpCodeRepository.findByUserAndPurposeAndUsedFalse(user, OtpPurpose.EMAIL_VERIFICATION)).thenReturn(List.of(otp));
        when(passwordEncoder.matches("000000", "otp-hash")).thenReturn(false);

        for (int attempt = 1; attempt <= 5; attempt++) {
            assertThrows(BadRequestException.class, () ->
                    service.verifyEmailOtp(new VerifyOtpRequest(user.getEmail(), "000000")));
            assertThat(otp.getFailedAttempts()).isEqualTo(attempt);
        }
        assertThat(otp.isUsed()).isTrue();
        verify(otpCodeRepository, org.mockito.Mockito.times(5)).save(otp);
    }

    @Test
    void correctOtpStillWorksBeforeTheAttemptLimit() {
        User user = User.builder()
                .id(4L)
                .fullName("OTP User")
                .email("correct-otp@example.com")
                .password("stored-hash")
                .role(UserRole.ATTENDEE)
                .emailVerified(false)
                .createdAt(Instant.now())
                .build();
        OtpCode otp = OtpCode.builder()
                .id(40L)
                .user(user)
                .purpose(OtpPurpose.EMAIL_VERIFICATION)
                .otpHash("otp-hash")
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(600))
                .used(false)
                .failedAttempts(2)
                .build();
        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
        when(otpCodeRepository.findByUserAndPurposeAndUsedFalse(user, OtpPurpose.EMAIL_VERIFICATION)).thenReturn(List.of(otp));
        when(passwordEncoder.matches("123456", "otp-hash")).thenReturn(true);

        service.verifyEmailOtp(new VerifyOtpRequest(user.getEmail(), "123456"));

        assertThat(otp.isUsed()).isTrue();
        assertThat(otp.getFailedAttempts()).isEqualTo(0);
        assertThat(user.isEmailVerified()).isTrue();
    }

}
