package com.eventify.platform.controller;

import com.eventify.platform.dto.auth.AuthResponse;
import com.eventify.platform.dto.auth.EmailRequest;
import com.eventify.platform.dto.auth.LoginRequest;
import com.eventify.platform.dto.auth.MessageResponse;
import com.eventify.platform.dto.auth.RefreshTokenRequest;
import com.eventify.platform.dto.auth.ResetPasswordRequest;
import com.eventify.platform.dto.auth.SignupRequest;
import com.eventify.platform.dto.auth.VerifyOtpRequest;
import com.eventify.platform.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<MessageResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/verify-email-otp")
    public ResponseEntity<MessageResponse> verifyEmailOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyEmailOtp(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password/request")
    public ResponseEntity<MessageResponse> forgotPasswordRequest(@Valid @RequestBody EmailRequest request) {
        return ResponseEntity.ok(authService.requestPasswordReset(request));
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<MessageResponse> forgotPasswordVerifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyPasswordResetOtp(request));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<MessageResponse> forgotPasswordReset(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.logout(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.me(authentication.getName()));
    }
}
