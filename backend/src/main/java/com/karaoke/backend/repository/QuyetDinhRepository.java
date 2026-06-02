package com.karaoke.backend.repository;

import com.karaoke.backend.domain.QuyetDinh;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuyetDinhRepository extends JpaRepository<QuyetDinh, Long> {
    List<QuyetDinh> findByEmployee_Id(String employeeId);
}
