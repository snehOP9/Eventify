package com.eventify.platform.service;

import com.eventify.platform.dto.auth.AuthResponse;
import com.eventify.platform.dto.auth.EmailRequest;
import com.eventify.platform.dto.auth.LoginRequest;
import com.eventify.platform.dto.auth.MessageResponse;
import com.eventify.platform.dto.auth.RefreshTokenRequest;
import com.eventify.platform.dto.auth.ResetPasswordRequest;
import com.eventify.platform.dto.auth.SignupRequest;
import com.eventify.platform.dto.auth.VerifyOtpRequest;

public interface AuthService {
    MessageResponse signup(SignupRequest request);
    MessageResponse verifyEmailOtp(VerifyOtpRequest request);
    AuthResponse login(LoginRequest request);
    MessageResponse requestPasswordReset(EmailRequest request);
    MessageResponse verifyPasswordResetOtp(VerifyOtpRequest request);
    MessageResponse resetPassword(ResetPasswordRequest request);
    AuthResponse refresh(RefreshTokenRequest request);
    MessageResponse logout(RefreshTokenRequest request);
    AuthResponse me(String email);
}
