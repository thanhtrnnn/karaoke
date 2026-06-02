package com.karaoke.backend.repository;

import com.karaoke.backend.domain.CaLamViec;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CaLamViecRepository extends JpaRepository<CaLamViec, Long> {
    List<CaLamViec> findByEmployee_Id(String employeeId);
    List<CaLamViec> findByEmployee_Branch_Id(String branchId);

    @Query("SELECT COUNT(c) > 0 FROM CaLamViec c WHERE c.employee.id = :employeeId AND c.ngayLam = :ngayLam AND c.loaiCa = :loaiCa")
    boolean existsDuplicateShift(@Param("employeeId") String employeeId, @Param("ngayLam") LocalDate ngayLam, @Param("loaiCa") String loaiCa);
}
