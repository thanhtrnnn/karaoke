package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Facility;
import com.karaoke.backend.domain.Room;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacilityRepository extends JpaRepository<Facility, String> {
    List<Facility> findByRoom(Room room);
}
