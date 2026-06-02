package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, String> {
    boolean existsByPhone(String phone);
    long countByTier(String tier);
}
