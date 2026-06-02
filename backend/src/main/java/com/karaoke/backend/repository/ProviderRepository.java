package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Provider;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProviderRepository extends JpaRepository<Provider, String> {}
