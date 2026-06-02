package com.karaoke.backend.repository;

import com.karaoke.backend.domain.DamageReport;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DamageReportRepository extends JpaRepository<DamageReport, String> {
    List<DamageReport> findByTrangThai(String trangThai);
}
