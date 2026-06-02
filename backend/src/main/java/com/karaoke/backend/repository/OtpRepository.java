package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Otp;
import com.karaoke.backend.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findTopByUserAndVerifiedFalseOrderByExpiresAtDesc(User user);
    List<Otp> findByUser(User user);
}
