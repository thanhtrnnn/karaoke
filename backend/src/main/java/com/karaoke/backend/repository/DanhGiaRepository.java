package com.karaoke.backend.repository;

import com.karaoke.backend.domain.DanhGia;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DanhGiaRepository extends JpaRepository<DanhGia, Long> {
    List<DanhGia> findByEmployee_Id(String employeeId);
}
