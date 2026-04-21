package com.eventify.platform.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestTracingFilter extends OncePerRequestFilter {

    public static final String REQUEST_ID_KEY = "requestId";
    public static final String REQUEST_ID_HEADER = "X-Request-Id";

    private static final Set<String> QUIET_PATHS = Set.of(
            "/actuator/health",
            "/actuator/info",
            "/health",
            "/api/health"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String requestId = resolveRequestId(request);
        long startedAt = System.nanoTime();
        boolean quietRequest = QUIET_PATHS.contains(LogSanitizer.safePath(request));

        MDC.put(REQUEST_ID_KEY, requestId);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        try {
            filterChain.doFilter(request, response);
        } catch (Exception exception) {
            if (!quietRequest) {
                log.error(
                        "HTTP request failed method={} path={} durationMs={} error={}",
                        request.getMethod(),
                        LogSanitizer.safePath(request),
                        Duration.ofNanos(System.nanoTime() - startedAt).toMillis(),
                        LogSanitizer.safeExceptionMessage(exception),
                        exception
                );
            }
            throw exception;
        } finally {
            if (!quietRequest) {
                log.info(
                        "HTTP request completed method={} path={} status={} durationMs={}",
                        request.getMethod(),
                        LogSanitizer.safePath(request),
                        response.getStatus(),
                        Duration.ofNanos(System.nanoTime() - startedAt).toMillis()
                );
            }
            MDC.remove(REQUEST_ID_KEY);
        }
    }

    private String resolveRequestId(HttpServletRequest request) {
        String existingRequestId = request.getHeader(REQUEST_ID_HEADER);
        if (existingRequestId != null && !existingRequestId.isBlank()) {
            return LogSanitizer.truncate(existingRequestId.trim(), 64);
        }

        return UUID.randomUUID().toString();
    }
}
