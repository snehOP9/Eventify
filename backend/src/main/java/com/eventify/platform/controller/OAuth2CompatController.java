package com.eventify.platform.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
public class OAuth2CompatController {

    @GetMapping("/oauth2/authorization/google")
    public ResponseEntity<Void> redirectLegacyGoogleOauthPath() {
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create("/api/oauth2/authorization/google"))
                .build();
    }

    @GetMapping("/oauth2/authorization/github")
    public ResponseEntity<Void> redirectLegacyGithubOauthPath() {
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create("/api/oauth2/authorization/github"))
                .build();
    }
}