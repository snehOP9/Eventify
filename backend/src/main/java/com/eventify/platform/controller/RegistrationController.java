package com.eventify.platform.controller;

import com.eventify.platform.dto.registration.RegistrationRequest;
import com.eventify.platform.dto.registration.RegistrationResponse;
import com.eventify.platform.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    public ResponseEntity<RegistrationResponse> register(@Valid @RequestBody RegistrationRequest request) {
        return ResponseEntity.ok(registrationService.register(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RegistrationResponse>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByUser(userId));
    }

    @DeleteMapping("/{registrationId}")
    public ResponseEntity<Void> cancel(@PathVariable Long registrationId) {
        registrationService.cancelRegistration(registrationId);
        return ResponseEntity.noContent().build();
    }
}
