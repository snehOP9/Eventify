package com.eventify.platform.repository;

import com.eventify.platform.entity.OtpCode;
import com.eventify.platform.entity.OtpPurpose;
import com.eventify.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    List<OtpCode> findByUserAndPurposeAndUsedFalse(User user, OtpPurpose purpose);

    Optional<OtpCode> findFirstByUserAndPurposeAndUsedFalseOrderByCreatedAtDesc(User user, OtpPurpose purpose);
}
