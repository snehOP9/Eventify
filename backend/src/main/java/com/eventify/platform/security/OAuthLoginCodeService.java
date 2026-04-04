package com.eventify.platform.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OAuthLoginCodeService {

    private final Map<String, CodeRecord> codes = new ConcurrentHashMap<>();
    private final long ttlSeconds;

    public OAuthLoginCodeService(@Value("${app.oauth2.code-ttl-seconds:90}") long ttlSeconds) {
        this.ttlSeconds = ttlSeconds;
    }

    public String issueCode(String email) {
        cleanupExpired();
        String code = UUID.randomUUID().toString();
        codes.put(code, new CodeRecord(email, Instant.now().plusSeconds(ttlSeconds)));
        return code;
    }

    public String consumeCode(String code) {
        if (code == null || code.isBlank()) {
            return null;
        }

        CodeRecord record = codes.remove(code);
        if (record == null) {
            return null;
        }

        if (record.expiresAt().isBefore(Instant.now())) {
            return null;
        }

        return record.email();
    }

    private void cleanupExpired() {
        Instant now = Instant.now();
        Iterator<Map.Entry<String, CodeRecord>> iterator = codes.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, CodeRecord> entry = iterator.next();
            if (entry.getValue().expiresAt().isBefore(now)) {
                iterator.remove();
            }
        }
    }

    private record CodeRecord(String email, Instant expiresAt) {
    }
}
