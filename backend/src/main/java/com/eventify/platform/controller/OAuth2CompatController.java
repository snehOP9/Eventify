package com.eventify.platform.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
public class OAuth2CompatController {

        @Value("${app.oauth2.backend-callback-base-url:http://localhost:8080}")
        private String backendCallbackBaseUrl;

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

    @GetMapping("/api/login/oauth2/code/{registrationId}")
    public ResponseEntity<Void> redirectLegacyOAuth2Callback(
            @PathVariable String registrationId,
            HttpServletRequest request
    ) {
        String queryString = request.getQueryString();
        UriComponentsBuilder redirectBuilder = UriComponentsBuilder
                .fromUriString(backendCallbackBaseUrl)
                .path("/login/oauth2/code/" + registrationId);

        if (queryString != null && !queryString.isBlank()) {
            redirectBuilder.query(queryString);
        }

        URI redirectUri = redirectBuilder.build(true).toUri();

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(redirectUri)
                .build();
    }
}