package com.eventify.platform.service.impl;

import com.eventify.platform.dto.auth.AuthResponse;
import com.eventify.platform.entity.AuthProvider;
import com.eventify.platform.entity.RefreshToken;
import com.eventify.platform.entity.User;
import com.eventify.platform.entity.UserRole;
import com.eventify.platform.repository.RefreshTokenRepository;
import com.eventify.platform.repository.UserRepository;
import com.eventify.platform.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OAuth2LoginService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.auth.refresh-token-expiration-seconds:1209600}")
    private long refreshTokenExpirationSeconds;

    @Transactional
    public AuthResponse handleGoogleLogin(OAuth2User oauth2User, UserRole requestedRole) {
        String email = oauth2User.getAttribute("email");
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("OAuth2 user email is missing");
        }

        Boolean emailVerified = oauth2User.getAttribute("email_verified");
        if (!Boolean.TRUE.equals(emailVerified)) {
            throw new IllegalStateException("Google account email is not verified");
        }

        String rawFullName = oauth2User.getAttribute("name");
        final String fullName = (rawFullName == null || rawFullName.isBlank()) ? email : rawFullName;

        String picture = oauth2User.getAttribute("picture");

        User user = userRepository.findByEmailIgnoreCase(email)
                .map(existing -> updateExistingOAuthUser(existing, fullName, picture))
            .orElseGet(() -> createOAuthUser(email, fullName, picture, requestedRole));

        userRepository.save(user);

        revokeAllUserRefreshTokens(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();

        String accessToken = jwtService.generateAccessToken(userDetails, Map.of(
                "role", user.getRole().name(),
                "userId", user.getId(),
                "name", user.getFullName(),
                "picture", user.getPictureUrl() == null ? "" : user.getPictureUrl()
        ));

        String refreshTokenValue = issueRefreshToken(user);

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

            @Transactional
            public AuthResponse exchangeFromOneTimeCode(String email) {
            User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalStateException("OAuth user not found"));

            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();

            String accessToken = jwtService.generateAccessToken(userDetails, Map.of(
                "role", user.getRole().name(),
                "userId", user.getId(),
                "name", user.getFullName(),
                "picture", user.getPictureUrl() == null ? "" : user.getPictureUrl()
            ));

            return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                accessToken,
                accessToken,
                null,
                "Bearer",
                jwtService.getAccessTokenExpirationSeconds(),
                user.isEmailVerified()
            );
            }

            @Transactional
            public AuthResponse rotateRefreshToken(String refreshToken) {
            RefreshToken existing = refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
                .orElseThrow(() -> new IllegalStateException("Invalid refresh token"));

            if (existing.getExpiresAt().isBefore(Instant.now())) {
                existing.setRevoked(true);
                refreshTokenRepository.save(existing);
                throw new IllegalStateException("Refresh token expired");
            }

            existing.setRevoked(true);
            refreshTokenRepository.save(existing);

            User user = existing.getUser();
            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();

            String accessToken = jwtService.generateAccessToken(userDetails, Map.of(
                "role", user.getRole().name(),
                "userId", user.getId(),
                "name", user.getFullName(),
                "picture", user.getPictureUrl() == null ? "" : user.getPictureUrl()
            ));

            String rotatedRefreshToken = issueRefreshToken(user);

            return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                accessToken,
                accessToken,
                rotatedRefreshToken,
                "Bearer",
                jwtService.getAccessTokenExpirationSeconds(),
                user.isEmailVerified()
            );
            }

            @Transactional
            public void revokeRefreshToken(String refreshToken) {
            refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
            }

    private User updateExistingOAuthUser(User existing, String fullName, String picture) {
        if (existing.getAuthProvider() == AuthProvider.LOCAL && !existing.isEmailVerified()) {
            throw new IllegalStateException("Local account email is not verified for linking");
        }

        existing.setFullName(fullName);
        existing.setPictureUrl(picture);

        if (existing.getAuthProvider() == null) {
            existing.setAuthProvider(AuthProvider.GOOGLE);
        }

        existing.setEmailVerified(true);
        if (existing.getFailedLoginAttempts() == null) {
            existing.setFailedLoginAttempts(0);
        }
        return existing;
    }

    private User createOAuthUser(String email, String fullName, String picture, UserRole requestedRole) {
        UserRole initialRole = requestedRole == UserRole.ORGANIZER ? UserRole.ORGANIZER : UserRole.ATTENDEE;
        return User.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .pictureUrl(picture)
                .authProvider(AuthProvider.GOOGLE)
                .emailVerified(true)
                .failedLoginAttempts(0)
                .lockedUntil(null)
                .role(initialRole)
                .createdAt(Instant.now())
                .build();
    }

    private String issueRefreshToken(User user) {
        String refreshTokenValue = UUID.randomUUID().toString();
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(refreshTokenValue)
                .revoked(false)
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(refreshTokenExpirationSeconds))
                .build());
        return refreshTokenValue;
    }

    private void revokeAllUserRefreshTokens(User user) {
        List<RefreshToken> active = refreshTokenRepository.findAllByUserAndRevokedFalse(user);
        if (active.isEmpty()) {
            return;
        }
        active.forEach(token -> token.setRevoked(true));
        refreshTokenRepository.saveAll(active);
    }
}
