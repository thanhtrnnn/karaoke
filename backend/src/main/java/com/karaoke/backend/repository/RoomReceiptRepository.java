package com.karaoke.backend.repository;

import com.karaoke.backend.domain.InvoiceStatus;
import com.karaoke.backend.domain.RoomReceipt;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomReceiptRepository extends JpaRepository<RoomReceipt, String> {
    List<RoomReceipt> findByStatus(InvoiceStatus status);
}
