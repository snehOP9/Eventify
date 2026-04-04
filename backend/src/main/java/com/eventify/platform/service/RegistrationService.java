package com.eventify.platform.service;

import com.eventify.platform.dto.registration.RegistrationRequest;
import com.eventify.platform.dto.registration.RegistrationResponse;

import java.util.List;

public interface RegistrationService {
    RegistrationResponse register(RegistrationRequest request);
    List<RegistrationResponse> getRegistrationsByUser(Long userId);
    void cancelRegistration(Long registrationId);
}
