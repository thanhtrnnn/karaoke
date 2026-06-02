package com.karaoke.backend.repository;

import com.karaoke.backend.domain.LoginSession;
import com.karaoke.backend.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginSessionRepository extends JpaRepository<LoginSession, Long> {
    Optional<LoginSession> findBySessionToken(String sessionToken);
    List<LoginSession> findByUser(User user);
}
