package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Booking;
import com.karaoke.backend.domain.BookingStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByStatus(BookingStatus status);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.room.id = :roomId AND b.status IN ('CONFIRMED', 'CHECKED_IN')")
    boolean existsActiveByRoomId(@Param("roomId") String roomId);

    // UC07: pending bookings filtered by branch and date
    @Query("SELECT b FROM Booking b WHERE b.status = :status AND (:branchId IS NULL OR b.room.branch.id = :branchId) AND (:date IS NULL OR CAST(b.startTime AS LocalDate) = :date)")
    List<Booking> findByStatusAndBranchAndDate(@Param("status") BookingStatus status, @Param("branchId") String branchId, @Param("date") java.time.LocalDate date);
}
