package com.karaoke.backend.repository;

import com.karaoke.backend.domain.ChamCong;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChamCongRepository extends JpaRepository<ChamCong, Long> {
    List<ChamCong> findByCaLamViec_Employee_Id(String employeeId);
    List<ChamCong> findByCaLamViec_Employee_Branch_Id(String branchId);
}
