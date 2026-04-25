package com.karaoke.backend.repository;

import com.karaoke.backend.domain.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class RoomRepositoryTest {

    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private BranchRepository branchRepository;

    private Branch createBranch(String id) {
        Branch b = new Branch();
        b.setId(id);
        b.setName("Branch " + id);
        return branchRepository.save(b);
    }

    private Room createRoom(String id, Branch branch, RoomStatus status) {
        Room r = new Room();
        r.setId(id);
        r.setName("Room " + id);
        r.setType("VIP");
        r.setCapacity(10);
        r.setHourlyPrice(new BigDecimal("100000"));
        r.setStatus(status);
        r.setBranch(branch);
        r.setActive(true);
        return roomRepository.save(r);
    }

    @Test
    void findByStatus_filtersCorrectly() {
        Branch branch = createBranch("B1");
        createRoom("R1", branch, RoomStatus.AVAILABLE);
        createRoom("R2", branch, RoomStatus.OCCUPIED);
        createRoom("R3", branch, RoomStatus.AVAILABLE);

        List<Room> available = roomRepository.findByStatus(RoomStatus.AVAILABLE);
        assertEquals(2, available.size());
        available.forEach(r -> assertEquals(RoomStatus.AVAILABLE, r.getStatus()));
    }

    @Test
    void saveWithBranch_persists() {
        Branch branch = createBranch("B2");
        Room room = createRoom("R4", branch, RoomStatus.AVAILABLE);

        Room found = roomRepository.findById("R4").orElseThrow();
        assertNotNull(found.getBranch());
        assertEquals("B2", found.getBranch().getId());
    }
}
