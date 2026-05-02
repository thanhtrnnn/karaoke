package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Room;
import com.karaoke.backend.domain.RoomStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, String> {
    List<Room> findByStatus(RoomStatus status);
}
