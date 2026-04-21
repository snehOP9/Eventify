package com.eventify.platform.exception;

import com.eventify.platform.logging.LogSanitizer;
import com.eventify.platform.logging.RequestTracingFilter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found path={} error={}", LogSanitizer.safePath(request), LogSanitizer.safeExceptionMessage(ex));
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
        log.warn("Bad request path={} error={}", LogSanitizer.safePath(request), LogSanitizer.safeExceptionMessage(ex));
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(EmailDeliveryException.class)
    public ResponseEntity<Map<String, Object>> handleEmailDelivery(EmailDeliveryException ex, HttpServletRequest request) {
        log.error("Email delivery failed path={} error={}", LogSanitizer.safePath(request), LogSanitizer.safeExceptionMessage(ex), ex);
        return build(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("timestamp", Instant.now());
        payload.put("status", HttpStatus.BAD_REQUEST.value());
        payload.put("errors", errors);
        payload.put("path", LogSanitizer.safePath(request));
        payload.put("requestId", MDC.get(RequestTracingFilter.REQUEST_ID_KEY));
        log.warn("Validation failed path={} fields={}", LogSanitizer.safePath(request), errors.keySet());
        return ResponseEntity.badRequest().body(payload);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception path={} error={}", LogSanitizer.safePath(request), LogSanitizer.safeExceptionMessage(ex), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request);
    }

    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String message, HttpServletRequest request) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("timestamp", Instant.now());
        payload.put("status", status.value());
        payload.put("message", message);
        payload.put("path", LogSanitizer.safePath(request));
        payload.put("requestId", MDC.get(RequestTracingFilter.REQUEST_ID_KEY));
        return ResponseEntity.status(status).body(payload);
    }
}
