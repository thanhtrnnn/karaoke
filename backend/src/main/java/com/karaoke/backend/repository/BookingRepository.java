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
}
