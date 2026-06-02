package com.karaoke.backend.repository;

import com.karaoke.backend.domain.ImportReceipt;
import com.karaoke.backend.domain.Provider;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImportReceiptRepository extends JpaRepository<ImportReceipt, String> {
    List<ImportReceipt> findByProvider(Provider provider);
}
