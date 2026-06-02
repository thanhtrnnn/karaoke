package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Promotion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionRepository extends JpaRepository<Promotion, String> {
    List<Promotion> findByStatusTrue();
}
