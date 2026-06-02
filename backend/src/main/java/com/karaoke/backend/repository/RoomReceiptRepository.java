package com.karaoke.backend.repository;

import com.karaoke.backend.domain.InvoiceStatus;
import com.karaoke.backend.domain.RoomReceipt;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomReceiptRepository extends JpaRepository<RoomReceipt, String> {
    List<RoomReceipt> findByStatus(InvoiceStatus status);

    List<RoomReceipt> findByBooking_Customer_Id(String clientId);

    @Query("SELECT r FROM RoomReceipt r WHERE r.booking.room.id = :roomId AND r.status = 'DRAFT' ORDER BY r.checkinTime DESC")
    Optional<RoomReceipt> findDraftByRoomId(@Param("roomId") String roomId);
}
