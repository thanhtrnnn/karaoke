package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Provider;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProviderRepository extends JpaRepository<Provider, String> {
    List<Provider> findByNameContainingIgnoreCase(String name);
}
