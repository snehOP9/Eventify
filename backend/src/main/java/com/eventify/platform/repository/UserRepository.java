package com.eventify.platform.repository;

import com.eventify.platform.entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);

    @Query("select count(u) from User u where u.emailVerified = true and (u.lockedUntil is null or u.lockedUntil <= :now)")
    long countActiveUsers(@Param("now") Instant now);
}
