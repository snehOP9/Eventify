package com.eventify.platform.dto.auth;

import com.eventify.platform.entity.UserRole;

public record AuthResponse(
        Long userId,
        String fullName,
        String email,
        UserRole role,
        String token,
        String accessToken,
        String refreshToken,
        String tokenType,
        Long expiresIn,
        boolean emailVerified
) {}
