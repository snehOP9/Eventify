package com.eventify.platform.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthProviderConstraintUpdater {

    private static final String CONSTRAINT_NAME = "users_auth_provider_check";

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void ensureGithubAuthProviderIsAllowed() {
        if (!isPostgreSql()) {
            return;
        }

        try {
            String currentDefinition = jdbcTemplate.query(
                    """
                    SELECT pg_get_constraintdef(c.oid)
                    FROM pg_constraint c
                    JOIN pg_class t ON c.conrelid = t.oid
                    WHERE t.relname = 'users' AND c.conname = ?
                    """,
                    ps -> ps.setString(1, CONSTRAINT_NAME),
                    rs -> rs.next() ? rs.getString(1) : null
            );

            if (currentDefinition == null) {
                log.debug("Constraint {} not found; skipping provider constraint update", CONSTRAINT_NAME);
                return;
            }

            if (currentDefinition.contains("GITHUB")) {
                return;
            }

            log.info("Updating {} to include GITHUB auth provider", CONSTRAINT_NAME);
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS " + CONSTRAINT_NAME);
            jdbcTemplate.execute(
                    "ALTER TABLE users ADD CONSTRAINT " + CONSTRAINT_NAME
                            + " CHECK (auth_provider::text = ANY (ARRAY['LOCAL'::character varying, 'GOOGLE'::character varying, 'GITHUB'::character varying]::text[]))"
            );
            log.info("Updated {} successfully", CONSTRAINT_NAME);
        } catch (Exception ex) {
            // Keep startup resilient in environments where schema ownership is restricted.
            log.warn("Could not update {}: {}", CONSTRAINT_NAME, ex.getMessage());
        }
    }

    private boolean isPostgreSql() {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            String databaseName = metaData.getDatabaseProductName();
            return databaseName != null && databaseName.toLowerCase().contains("postgresql");
        } catch (Exception ex) {
            log.debug("Unable to detect database vendor: {}", ex.getMessage());
            return false;
        }
    }
}