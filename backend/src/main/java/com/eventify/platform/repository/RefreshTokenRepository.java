package com.eventify.platform.repository;

import com.eventify.platform.entity.RefreshToken;
import com.eventify.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);

    List<RefreshToken> findAllByUserAndRevokedFalse(User user);

    void deleteByUser(User user);
}
