package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Booking;
import com.karaoke.backend.domain.BookingStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByStatus(BookingStatus status);
}
