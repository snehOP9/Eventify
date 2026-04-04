package com.eventify.platform.service;

public interface EmailService {
    void sendOtpEmail(String to, String subject, String otp, String context);
}
