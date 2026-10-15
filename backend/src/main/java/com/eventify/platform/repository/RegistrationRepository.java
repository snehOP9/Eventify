package com.eventify.platform.repository;

import com.eventify.platform.entity.Registration;
import com.eventify.platform.entity.RegistrationStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUserId(Long userId);
    List<Registration> findByEventId(Long eventId);
    long countByStatus(RegistrationStatus status);

    @Query("select count(r) from Registration r where r.event.organizer.id = :organizerId and r.status = :status")
    long countByOrganizerAndStatus(@Param("organizerId") Long organizerId, @Param("status") RegistrationStatus status);

    @Query("select count(r) from Registration r where r.user.id = :userId and r.status = :status")
    long countByUserAndStatus(@Param("userId") Long userId, @Param("status") RegistrationStatus status);

    @Query("select count(r) from Registration r where r.user.id = :userId and r.status = :status and r.event.eventDate >= :today")
    long countUpcomingByUserAndStatus(@Param("userId") Long userId, @Param("status") RegistrationStatus status, @Param("today") LocalDate today);
}
