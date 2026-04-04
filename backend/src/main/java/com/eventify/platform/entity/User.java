package com.eventify.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column
    private String pictureUrl;

    @Enumerated(EnumType.STRING)
    @Column
    private AuthProvider authProvider;

    @Column
    private boolean emailVerified;

    @Column
    private Integer failedLoginAttempts;

    @Column
    private Instant lockedUntil;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private Instant createdAt;
}
