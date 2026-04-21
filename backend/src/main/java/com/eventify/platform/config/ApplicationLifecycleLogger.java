package com.eventify.platform.config;

import com.eventify.platform.logging.LogSanitizer;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationFailedEvent;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationLifecycleLogger {

    private final Environment environment;

    @PostConstruct
    public void registerUncaughtExceptionLogger() {
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) ->
                log.error(
                        "Uncaught exception on thread={} error={}",
                        thread.getName(),
                        LogSanitizer.safeExceptionMessage(throwable),
                        throwable
                )
        );
    }

    @EventListener
    public void onApplicationReady(ApplicationReadyEvent event) {
        log.info(
                "Application ready service={} runtimeEnvironment={} port={}",
                environment.getProperty("spring.application.name", "event-platform"),
                environment.getProperty("app.runtime-environment", "development"),
                environment.getProperty("local.server.port", environment.getProperty("server.port", "8080"))
        );
    }

    @EventListener
    public void onApplicationFailed(ApplicationFailedEvent event) {
        Throwable exception = event.getException();
        log.error(
                "Application startup failed runtimeEnvironment={} error={}",
                environment.getProperty("app.runtime-environment", "development"),
                LogSanitizer.safeExceptionMessage(exception),
                exception
        );
    }

    @PreDestroy
    public void onShutdown() {
        log.info("Application shutdown signal received");
    }
}
