package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Invoice;
import com.karaoke.backend.domain.InvoiceStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    List<Invoice> findByStatus(InvoiceStatus status);
}
