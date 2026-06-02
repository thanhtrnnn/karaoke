package com.karaoke.backend.repository;

import com.karaoke.backend.domain.ImportDetail;
import com.karaoke.backend.domain.ImportReceipt;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImportDetailRepository extends JpaRepository<ImportDetail, Long> {
    List<ImportDetail> findByImportReceipt(ImportReceipt importReceipt);
}
