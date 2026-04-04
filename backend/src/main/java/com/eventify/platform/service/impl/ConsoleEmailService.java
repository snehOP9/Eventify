package com.eventify.platform.service.impl;

import com.eventify.platform.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ConsoleEmailService implements EmailService {

    @Override
    public void sendOtpEmail(String to, String subject, String otp, String context) {
        // Placeholder implementation for local development.
        log.info("OTP email simulated. to={}, subject={}, context={}, otp={}", to, subject, context, otp);
    }
}
