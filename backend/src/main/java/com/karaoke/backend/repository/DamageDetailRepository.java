package com.karaoke.backend.repository;

import com.karaoke.backend.domain.DamageDetail;
import com.karaoke.backend.domain.DamageReport;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DamageDetailRepository extends JpaRepository<DamageDetail, Long> {
    List<DamageDetail> findByDamageReport(DamageReport damageReport);
}
