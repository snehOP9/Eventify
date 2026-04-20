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
import java.util.Locale;
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
    public AuthResponse handleOAuthLogin(OAuth2User oauth2User, String registrationId, UserRole requestedRole) {
        AuthProvider provider = resolveProvider(registrationId);
        String email = extractEmail(oauth2User, provider);
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("OAuth2 user email is missing");
        }

        ensureEmailVerified(oauth2User, provider);

        String fullName = extractFullName(oauth2User, provider, email);
        String picture = extractPicture(oauth2User, provider);

        User user = userRepository.findByEmailIgnoreCase(email)
                .map(existing -> updateExistingOAuthUser(existing, fullName, picture, provider))
            .orElseGet(() -> createOAuthUser(email, fullName, picture, provider, requestedRole));

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

    private User updateExistingOAuthUser(User existing, String fullName, String picture, AuthProvider provider) {
        if (existing.getAuthProvider() == AuthProvider.LOCAL && !existing.isEmailVerified()) {
            throw new IllegalStateException("Local account email is not verified for linking");
        }

        existing.setFullName(fullName);
        existing.setPictureUrl(picture);

        if (existing.getAuthProvider() == null || existing.getAuthProvider() != AuthProvider.LOCAL) {
            existing.setAuthProvider(provider);
        }

        existing.setEmailVerified(true);
        if (existing.getFailedLoginAttempts() == null) {
            existing.setFailedLoginAttempts(0);
        }
        return existing;
    }

    private User createOAuthUser(String email, String fullName, String picture, AuthProvider provider, UserRole requestedRole) {
        UserRole initialRole = requestedRole == UserRole.ORGANIZER ? UserRole.ORGANIZER : UserRole.ATTENDEE;
        return User.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .pictureUrl(picture)
                .authProvider(provider)
                .emailVerified(true)
                .failedLoginAttempts(0)
                .lockedUntil(null)
                .role(initialRole)
                .createdAt(Instant.now())
                .build();
    }

    private AuthProvider resolveProvider(String registrationId) {
        if (registrationId == null || registrationId.isBlank()) {
            throw new IllegalStateException("OAuth2 provider is missing");
        }

        if ("google".equalsIgnoreCase(registrationId)) {
            return AuthProvider.GOOGLE;
        }

        if ("github".equalsIgnoreCase(registrationId)) {
            return AuthProvider.GITHUB;
        }

        throw new IllegalStateException("Unsupported OAuth2 provider: " + registrationId);
    }

    private String extractEmail(OAuth2User oauth2User, AuthProvider provider) {
        String email = oauth2User.getAttribute("email");
        if (email != null && !email.isBlank()) {
            return email.trim();
        }

        if (provider == AuthProvider.GITHUB) {
            Long githubId = extractGithubId(oauth2User);
            if (githubId != null) {
                return "github-" + githubId + "@users.noreply.github.com";
            }

            String login = oauth2User.getAttribute("login");
            if (login != null && !login.isBlank()) {
                return login.trim().toLowerCase(Locale.ROOT) + "@users.noreply.github.com";
            }
        }

        return null;
    }

    private void ensureEmailVerified(OAuth2User oauth2User, AuthProvider provider) {
        if (provider == AuthProvider.GOOGLE) {
            Boolean emailVerified = oauth2User.getAttribute("email_verified");
            if (!Boolean.TRUE.equals(emailVerified)) {
                throw new IllegalStateException("Google account email is not verified");
            }
        }
    }

    private String extractFullName(OAuth2User oauth2User, AuthProvider provider, String fallbackEmail) {
        String fullName = oauth2User.getAttribute("name");

        if ((fullName == null || fullName.isBlank()) && provider == AuthProvider.GITHUB) {
            fullName = oauth2User.getAttribute("login");
        }

        if (fullName == null || fullName.isBlank()) {
            return fallbackEmail;
        }

        return fullName;
    }

    private String extractPicture(OAuth2User oauth2User, AuthProvider provider) {
        String picture = oauth2User.getAttribute("picture");

        if ((picture == null || picture.isBlank()) && provider == AuthProvider.GITHUB) {
            picture = oauth2User.getAttribute("avatar_url");
        }

        return picture;
    }

    private Long extractGithubId(OAuth2User oauth2User) {
        Object rawId = oauth2User.getAttribute("id");
        if (rawId instanceof Number number) {
            return number.longValue();
        }

        if (rawId instanceof String text && !text.isBlank()) {
            try {
                return Long.parseLong(text);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }

        return null;
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
