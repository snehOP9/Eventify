package com.eventify.platform.config;

import com.eventify.platform.logging.LogSanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.net.URI;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Slf4j
@Component
@RequiredArgsConstructor
public class StartupEnvironmentValidator implements ApplicationRunner {

    private static final String DEFAULT_JWT_SECRET = "ZXZlbnQtcGxhdGZvcm0tand0LXNlY3JldC1rZXktY2hhbmdlLW1lLTIwMjY=";

    private final Environment environment;
    private final DataSource dataSource;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        String runtimeEnvironment = property("app.runtime-environment", "development").toLowerCase(Locale.ROOT);
        boolean production = "production".equals(runtimeEnvironment);

        String datasourceUrl = firstNonBlank(
                property("spring.datasource.url", ""),
                property("SPRING_DATASOURCE_URL", ""),
                property("DATABASE_URL", "")
        );
        String frontendRedirectUri = property("app.oauth2.redirect-uri", "");
        String backendBaseUrl = property("app.oauth2.backend-callback-base-url", "");
        String allowedOrigins = property("app.cors.allowed-origins", "");
        String allowedOriginPatterns = property("app.cors.allowed-origin-patterns", "");
        String googleClientId = property("spring.security.oauth2.client.registration.google.client-id", "");
        String githubClientId = property("spring.security.oauth2.client.registration.github.client-id", "");
        boolean mailEnabled = environment.getProperty("app.mail.enabled", Boolean.class, false);
        String mailProvider = property("app.mail.provider", "smtp");
        boolean razorpayConfigured = hasText(property("app.razorpay.key-id", ""))
                && hasText(property("app.razorpay.key-secret", ""));

        log.info(
                "Startup configuration runtimeEnvironment={} datasource={} frontendRedirectUri={} backendBaseUrl={} allowedOrigins={} allowedOriginPatterns={} googleOAuthConfigured={} githubOAuthConfigured={} mailEnabled={} mailProvider={} razorpayConfigured={}",
                runtimeEnvironment,
                sanitizeJdbcUrl(datasourceUrl),
                frontendRedirectUri,
                backendBaseUrl,
                allowedOrigins,
                allowedOriginPatterns,
                isProviderConfigured(googleClientId),
                isProviderConfigured(githubClientId),
                mailEnabled,
                mailProvider,
                razorpayConfigured
        );

        if (production) {
            List<String> validationErrors = validateProductionConfiguration();
            if (!validationErrors.isEmpty()) {
                validationErrors.forEach(error -> log.error("Startup validation failed: {}", error));
                throw new IllegalStateException("Production environment validation failed. See logs for details.");
            }
        }

        verifyDatabaseConnectivity(production);

        if (!razorpayConfigured) {
            log.warn("Razorpay keys are not configured. Paid checkout endpoints will remain unavailable until APP_RAZORPAY_KEY_ID and APP_RAZORPAY_KEY_SECRET are set.");
        }
    }

    private List<String> validateProductionConfiguration() {
        List<String> errors = new ArrayList<>();

        String datasourceUrl = firstNonBlank(
                property("spring.datasource.url", ""),
                property("SPRING_DATASOURCE_URL", ""),
                property("DATABASE_URL", "")
        );
        String frontendRedirectUri = property("app.oauth2.redirect-uri", "");
        String backendBaseUrl = property("app.oauth2.backend-callback-base-url", "");
        String allowedOrigins = property("app.cors.allowed-origins", "");
        String googleClientId = property("spring.security.oauth2.client.registration.google.client-id", "");
        String googleClientSecret = property("spring.security.oauth2.client.registration.google.client-secret", "");
        String jwtSecret = property("app.jwt.secret", "");
        boolean secureCookies = environment.getProperty("app.auth.cookies.secure", Boolean.class, false);
        String sameSite = property("app.auth.cookies.same-site", "Lax");
        boolean mailEnabled = environment.getProperty("app.mail.enabled", Boolean.class, false);
        String mailProvider = property("app.mail.provider", "smtp").toLowerCase(Locale.ROOT);
        String googleRedirectUriOverride = firstNonBlank(
                property("APP_GOOGLE_OAUTH2_REDIRECT_URI", ""),
                property("app.google.oauth2.redirect-uri", "")
        );
        String githubRedirectUriOverride = firstNonBlank(
                property("APP_GITHUB_OAUTH2_REDIRECT_URI", ""),
                property("app.github.oauth2.redirect-uri", "")
        );

        if (!hasText(datasourceUrl) || datasourceUrl.contains("jdbc:h2:")) {
            errors.add("Production requires a non-H2 database connection string.");
        }

        if (containsLegacyReference(datasourceUrl)) {
            errors.add("Database configuration still points to a legacy provider.");
        }

        if (!isHttpsAbsoluteUrl(frontendRedirectUri)) {
            errors.add("APP_OAUTH2_REDIRECT_URI must be an absolute HTTPS URL in production.");
        }

        if (!isHttpsAbsoluteUrl(backendBaseUrl)) {
            errors.add("APP_OAUTH2_BACKEND_CALLBACK_BASE_URL must be an absolute HTTPS URL in production.");
        }

        if (containsLegacyReference(frontendRedirectUri) || containsLegacyReference(backendBaseUrl)) {
            errors.add("OAuth URLs must not reference legacy domains in production.");
        }

        String frontendOrigin = LogSanitizer.originOf(frontendRedirectUri);
        List<String> originEntries = splitCsv(allowedOrigins);
        if (!hasText(frontendOrigin) || !originEntries.contains(frontendOrigin)) {
            errors.add("APP_CORS_ALLOWED_ORIGINS must include the frontend origin derived from APP_OAUTH2_REDIRECT_URI.");
        }

        if (originEntries.stream().anyMatch(origin -> origin.contains("*"))) {
            errors.add("APP_CORS_ALLOWED_ORIGINS must use explicit origins only. Wildcards are not allowed in production.");
        }

        if (!isProviderConfigured(googleClientId) || !hasText(googleClientSecret)) {
            errors.add("Google OAuth credentials must be configured in production.");
        }

        if (!secureCookies) {
            errors.add("APP_AUTH_COOKIES_SECURE must be true in production.");
        }

        if (!"None".equalsIgnoreCase(sameSite)) {
            errors.add("APP_AUTH_COOKIES_SAME_SITE must be None in production for cross-site cookie flows.");
        }

        if (!hasText(jwtSecret) || DEFAULT_JWT_SECRET.equals(jwtSecret)) {
            errors.add("APP_JWT_SECRET must be set to a custom secret in production.");
        }

        if (!mailEnabled) {
            errors.add("APP_MAIL_ENABLED must be true in production so OTP and registration emails work.");
        } else if ("resend".equals(mailProvider)) {
            if (!hasText(property("app.mail.resend.api-key", "")) || !hasText(property("app.mail.from", ""))) {
                errors.add("Resend email delivery requires APP_MAIL_RESEND_API_KEY and APP_MAIL_FROM in production.");
            }
        } else if ("smtp".equals(mailProvider)) {
            if (!hasText(property("spring.mail.host", ""))
                    || !hasText(property("spring.mail.username", ""))
                    || !hasText(property("spring.mail.password", ""))
                    || !hasText(property("app.mail.from", ""))) {
                errors.add("SMTP delivery requires SPRING_MAIL_HOST, SPRING_MAIL_USERNAME, SPRING_MAIL_PASSWORD, and APP_MAIL_FROM in production.");
            }
        } else {
            errors.add("APP_MAIL_PROVIDER must be set to either smtp or resend in production.");
        }

        if (hasText(googleRedirectUriOverride)) {
            String expectedGoogleRedirect = stripTrailingSlash(backendBaseUrl) + "/login/oauth2/code/google";
            if (!expectedGoogleRedirect.equals(googleRedirectUriOverride)) {
                errors.add("APP_GOOGLE_OAUTH2_REDIRECT_URI must exactly match APP_OAUTH2_BACKEND_CALLBACK_BASE_URL + /login/oauth2/code/google.");
            }
        }

        if (hasText(githubRedirectUriOverride) && containsLegacyReference(githubRedirectUriOverride)) {
            errors.add("APP_GITHUB_OAUTH2_REDIRECT_URI must not reference legacy domains in production.");
        }

        return errors;
    }

    private void verifyDatabaseConnectivity(boolean production) {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            log.info(
                    "Database connectivity verified vendor={} version={} url={}",
                    metaData.getDatabaseProductName(),
                    metaData.getDatabaseProductVersion(),
                    sanitizeJdbcUrl(metaData.getURL())
            );
        } catch (Exception exception) {
            log.error("Database connectivity verification failed error={}", LogSanitizer.safeExceptionMessage(exception), exception);
            if (production) {
                throw new IllegalStateException("Database connectivity verification failed.", exception);
            }
        }
    }

    private String sanitizeJdbcUrl(String rawUrl) {
        if (!hasText(rawUrl)) {
            return "n/a";
        }

        String normalized = rawUrl.trim();
        String withoutJdbcPrefix = normalized.startsWith("jdbc:") ? normalized.substring(5) : normalized;

        try {
            URI uri = URI.create(withoutJdbcPrefix);
            if (uri.getScheme() != null && uri.getHost() != null) {
                String port = uri.getPort() > 0 ? ":" + uri.getPort() : "";
                String path = uri.getPath() == null ? "" : uri.getPath();
                return uri.getScheme() + "://" + uri.getHost() + port + path;
            }
        } catch (Exception ignored) {
            // Fall through to string sanitization below.
        }

        return LogSanitizer.truncate(
                normalized.replaceAll("://[^:@/]+:[^@/]+@", "://****:****@"),
                120
        );
    }

    private boolean isHttpsAbsoluteUrl(String value) {
        if (!hasText(value)) {
            return false;
        }

        try {
            URI uri = URI.create(value.trim());
            return "https".equalsIgnoreCase(uri.getScheme()) && uri.getHost() != null;
        } catch (Exception exception) {
            return false;
        }
    }

    private boolean containsLegacyReference(String value) {
        return hasText(value) && value.toLowerCase(Locale.ROOT).contains("legacy-provider");
    }

    private boolean isProviderConfigured(String clientId) {
        return hasText(clientId) && !clientId.toLowerCase(Locale.ROOT).startsWith("dummy-");
    }

    private List<String> splitCsv(String value) {
        return Arrays.stream(String.valueOf(value).split(","))
                .map(String::trim)
                .filter(this::hasText)
                .toList();
    }

    private String stripTrailingSlash(String value) {
        return value == null ? "" : value.replaceAll("/+$", "");
    }

    private String property(String key, String defaultValue) {
        return environment.getProperty(key, defaultValue);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (hasText(value)) {
                return value;
            }
        }
        return "";
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
