package com.eventify.platform.service.impl;

import com.eventify.platform.dto.auth.AuthResponse;
import com.eventify.platform.dto.auth.EmailRequest;
import com.eventify.platform.dto.auth.LoginRequest;
import com.eventify.platform.dto.auth.MessageResponse;
import com.eventify.platform.dto.auth.RefreshTokenRequest;
import com.eventify.platform.dto.auth.ResetPasswordRequest;
import com.eventify.platform.dto.auth.SignupRequest;
import com.eventify.platform.dto.auth.VerifyOtpRequest;
import com.eventify.platform.entity.AuthProvider;
import com.eventify.platform.entity.OtpCode;
import com.eventify.platform.entity.OtpPurpose;
import com.eventify.platform.entity.RefreshToken;
import com.eventify.platform.entity.User;
import com.eventify.platform.exception.BadRequestException;
import com.eventify.platform.logging.LogSanitizer;
import com.eventify.platform.repository.OtpCodeRepository;
import com.eventify.platform.repository.RefreshTokenRepository;
import com.eventify.platform.repository.UserRepository;
import com.eventify.platform.security.JwtService;
import com.eventify.platform.service.AuthService;
import com.eventify.platform.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;

    @Value("${app.auth.otp-expiration-seconds:600}")
    private long otpExpirationSeconds;

    @Value("${app.auth.otp-resend-interval-seconds:60}")
    private long otpResendIntervalSeconds;

    @Value("${app.auth.refresh-token-expiration-seconds:1209600}")
    private long refreshTokenExpirationSeconds;

    @Value("${app.auth.max-failed-login-attempts:5}")
    private int maxFailedLoginAttempts;

    @Value("${app.auth.lockout-duration-seconds:900}")
    private long lockoutDurationSeconds;

    @Override
    @Transactional
    public MessageResponse signup(SignupRequest request) {
        log.info("Signup requested email={} role={}", LogSanitizer.maskEmail(request.email()), request.role());
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            throw new BadRequestException("Email already exists");
        });

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
            .authProvider(AuthProvider.LOCAL)
                .role(request.role())
                .emailVerified(false)
                .failedLoginAttempts(0)
                .lockedUntil(null)
                .createdAt(Instant.now())
                .build();

        User saved = userRepository.save(user);
        log.info("Signup created userId={} email={}", saved.getId(), LogSanitizer.maskEmail(saved.getEmail()));
        String otp = issueOtp(saved, OtpPurpose.EMAIL_VERIFICATION);
        emailService.sendOtpEmail(saved.getEmail(), "Verify your email", otp, "email-verification");
        return new MessageResponse("Signup successful. Please verify your email with the OTP sent to your inbox.");
    }

    @Override
    @Transactional
    public MessageResponse verifyEmailOtp(VerifyOtpRequest request) {
        User user = findByEmail(request.email());
        validateOtpAndConsume(user, OtpPurpose.EMAIL_VERIFICATION, request.otp());
        user.setEmailVerified(true);
        userRepository.save(user);
        log.info("Email verification completed userId={} email={}", user.getId(), LogSanitizer.maskEmail(user.getEmail()));
        return new MessageResponse("Email verified successfully.");
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login requested email={}", LogSanitizer.maskEmail(request.email()));
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now())) {
            log.warn("Login blocked accountLocked userId={}", user.getId());
            throw new BadRequestException("Account is temporarily locked. Try again later.");
        }

        if (!user.isEmailVerified()) {
            log.warn("Login blocked emailUnverified userId={}", user.getId());
            throw new BadRequestException("Email not verified. Please verify your email before logging in.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            int attempts = (user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts()) + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= maxFailedLoginAttempts) {
                user.setLockedUntil(Instant.now().plusSeconds(lockoutDurationSeconds));
                user.setFailedLoginAttempts(0);
            }
            userRepository.save(user);
            log.warn("Login failed invalidPassword userId={} attempts={}", user.getId(), attempts);
            throw new BadRequestException("Invalid email or password");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        log.info("Login succeeded userId={} role={}", user.getId(), user.getRole());

        return issueTokens(user);
    }

    @Override
    @Transactional
    public MessageResponse requestPasswordReset(EmailRequest request) {
        User user = findByEmail(request.email());
        log.info("Password reset requested userId={} email={}", user.getId(), LogSanitizer.maskEmail(user.getEmail()));
        String otp = issueOtp(user, OtpPurpose.PASSWORD_RESET);
        emailService.sendOtpEmail(user.getEmail(), "Reset your password", otp, "password-reset");
        return new MessageResponse("Password reset OTP sent.");
    }

    @Override
    @Transactional(readOnly = true)
    public MessageResponse verifyPasswordResetOtp(VerifyOtpRequest request) {
        User user = findByEmail(request.email());
        validateOtp(user, OtpPurpose.PASSWORD_RESET, request.otp());
        return new MessageResponse("OTP is valid.");
    }

    @Override
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = findByEmail(request.email());
        validateOtpAndConsume(user, OtpPurpose.PASSWORD_RESET, request.otp());

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        refreshTokenRepository.deleteByUser(user);
        log.info("Password reset completed userId={}", user.getId());
        return new MessageResponse("Password reset successful.");
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken existing = refreshTokenRepository.findByTokenAndRevokedFalse(request.refreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (existing.getExpiresAt().isBefore(Instant.now())) {
            existing.setRevoked(true);
            refreshTokenRepository.save(existing);
            throw new BadRequestException("Refresh token expired");
        }

        existing.setRevoked(true);
        refreshTokenRepository.save(existing);
        log.info("Refresh token rotated userId={}", existing.getUser().getId());

        return issueTokens(existing.getUser());
    }

    @Override
    @Transactional
    public MessageResponse logout(RefreshTokenRequest request) {
        refreshTokenRepository.findByTokenAndRevokedFalse(request.refreshToken())
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                    log.info("Logout completed userId={}", token.getUser().getId());
                });
        return new MessageResponse("Logged out successfully.");
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse me(String email) {
        User user = findByEmail(email);
        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                null,
                null,
                null,
                "Bearer",
                jwtService.getAccessTokenExpirationSeconds(),
                user.isEmailVerified()
        );
    }

    private AuthResponse issueTokens(User user) {
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();

        String accessToken = jwtService.generateAccessToken(userDetails, Map.of(
                "role", user.getRole().name(),
                "userId", user.getId()
        ));

        String refreshTokenValue = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenValue)
                .revoked(false)
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(refreshTokenExpirationSeconds))
                .build();
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                accessToken,
                accessToken,
                refreshTokenValue,
                "Bearer",
                jwtService.getAccessTokenExpirationSeconds(),
                user.isEmailVerified()
        );
    }

    private User findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    private String issueOtp(User user, OtpPurpose purpose) {
        otpCodeRepository.findFirstByUserAndPurposeAndUsedFalseOrderByCreatedAtDesc(user, purpose)
                .ifPresent(lastOtp -> {
                    if (lastOtp.getCreatedAt().isAfter(Instant.now().minusSeconds(otpResendIntervalSeconds))) {
                        throw new BadRequestException("Please wait before requesting another OTP.");
                    }
                });

        List<OtpCode> activeOtps = otpCodeRepository.findByUserAndPurposeAndUsedFalse(user, purpose);
        for (OtpCode otpCode : activeOtps) {
            otpCode.setUsed(true);
        }
        if (!activeOtps.isEmpty()) {
            otpCodeRepository.saveAll(activeOtps);
        }

        String otp = generateOtp();
        OtpCode otpCode = OtpCode.builder()
                .user(user)
                .purpose(purpose)
                .otpHash(passwordEncoder.encode(otp))
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(otpExpirationSeconds))
                .used(false)
                .build();
        otpCodeRepository.save(otpCode);
        return otp;
    }

    private void validateOtp(User user, OtpPurpose purpose, String rawOtp) {
        List<OtpCode> activeOtps = otpCodeRepository.findByUserAndPurposeAndUsedFalse(user, purpose);
        boolean matched = activeOtps.stream()
                .filter(otpCode -> otpCode.getExpiresAt().isAfter(Instant.now()))
                .anyMatch(otpCode -> passwordEncoder.matches(rawOtp, otpCode.getOtpHash()));

        if (!matched) {
            throw new BadRequestException("Invalid or expired OTP");
        }
    }

    private void validateOtpAndConsume(User user, OtpPurpose purpose, String rawOtp) {
        List<OtpCode> activeOtps = otpCodeRepository.findByUserAndPurposeAndUsedFalse(user, purpose);

        OtpCode matchedOtp = activeOtps.stream()
                .filter(otpCode -> otpCode.getExpiresAt().isAfter(Instant.now()))
                .filter(otpCode -> passwordEncoder.matches(rawOtp, otpCode.getOtpHash()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        matchedOtp.setUsed(true);
        otpCodeRepository.save(matchedOtp);
    }

    private String generateOtp() {
        int value = (int) (Math.random() * 1_000_000);
        return String.format("%06d", value);
    }
}
