package com.karaoke.backend.repository;

import com.karaoke.backend.domain.SystemConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {
    Optional<SystemConfig> findByConfigKey(String configKey);
}
