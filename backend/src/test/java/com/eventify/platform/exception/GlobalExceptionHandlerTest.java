package com.eventify.platform.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleGeneric_returnsSafeMessageWithoutLeakingInternalDetails() {
        Exception ex = new Exception("Database password invalid at /opt/service/config");

        ResponseEntity<Map<String, Object>> response = handler.handleGeneric(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).containsEntry("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        assertThat(response.getBody()).containsEntry("message", "Internal server error");
        assertThat(response.getBody().get("timestamp")).isInstanceOf(Instant.class);
        assertThat(response.getBody().get("message")).isNotEqualTo(ex.getMessage());
    }

    @Test
    void specificHandlers_keepExistingStatusAndMessageBehavior() {
        ResponseEntity<Map<String, Object>> notFound = handler.handleNotFound(new ResourceNotFoundException("Event not found"));
        ResponseEntity<Map<String, Object>> badRequest = handler.handleBadRequest(new BadRequestException("Invalid request"));

        assertThat(notFound.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(notFound.getBody()).containsEntry("message", "Event not found");

        assertThat(badRequest.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(badRequest.getBody()).containsEntry("message", "Invalid request");
    }
}
