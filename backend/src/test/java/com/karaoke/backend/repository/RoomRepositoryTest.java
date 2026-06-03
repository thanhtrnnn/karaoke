package com.karaoke.backend.repository;

import com.karaoke.backend.domain.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("Room Repository — UC20: Truy vấn phòng")
class RoomRepositoryTest {

    @Autowired private RoomRepository roomRepository;
    @Autowired private BranchRepository branchRepository;
    @Autowired private RoomTypeRepository roomTypeRepository;

    private Branch createBranch(String id) {
        Branch b = new Branch();
        b.setId(id);
        b.setName("Branch " + id);
        return branchRepository.save(b);
    }

    private RoomType createRoomType(String id) {
        RoomType rt = new RoomType();
        rt.setId(id);
        rt.setNameType("VIP");
        rt.setCapacity(10);
        rt.setPrice(new BigDecimal("100000"));
        rt.setStatus(true);
        return roomTypeRepository.save(rt);
    }

    private Room createRoom(String id, Branch branch, RoomType roomType, RoomStatus status) {
        Room r = new Room();
        r.setId(id);
        r.setName("Room " + id);
        r.setRoomType(roomType);
        r.setCapacity(10);
        r.setPrice(new BigDecimal("100000"));
        r.setStatus(status);
        r.setBranch(branch);
        r.setActive(true);
        return roomRepository.save(r);
    }

    @Test
    @DisplayName("UC20 — findByStatus lọc đúng phòng AVAILABLE")
    void UC20_findByStatus_filtersCorrectly() {
        Branch branch = createBranch("B1");
        RoomType rt = createRoomType("RT1");
        createRoom("R1", branch, rt, RoomStatus.AVAILABLE);
        createRoom("R2", branch, rt, RoomStatus.OCCUPIED);
        createRoom("R3", branch, rt, RoomStatus.AVAILABLE);

        List<Room> available = roomRepository.findByStatus(RoomStatus.AVAILABLE);
        assertEquals(2, available.size());
        available.forEach(r -> assertEquals(RoomStatus.AVAILABLE, r.getStatus()));
    }

    @Test
    @DisplayName("UC20 — Phòng lưu đúng quan hệ với Branch")
    void UC20_saveWithBranch_persists() {
        Branch branch = createBranch("B2");
        RoomType rt = createRoomType("RT2");
        createRoom("R4", branch, rt, RoomStatus.AVAILABLE);

        Room found = roomRepository.findById("R4").orElseThrow();
        assertNotNull(found.getBranch());
        assertEquals("B2", found.getBranch().getId());
    }

    @Test
    @DisplayName("UC20 — Phòng lưu đúng quan hệ với RoomType")
    void UC20_saveWithRoomType_persists() {
        Branch branch = createBranch("B3");
        RoomType rt = createRoomType("RT3");
        rt.setNameType("Deluxe");
        roomTypeRepository.save(rt);
        createRoom("R5", branch, rt, RoomStatus.AVAILABLE);

        Room found = roomRepository.findById("R5").orElseThrow();
        assertNotNull(found.getRoomType());
        assertEquals("RT3", found.getRoomType().getId());
        assertEquals("Deluxe", found.getRoomType().getNameType());
    }

    @Test
    @DisplayName("UC20 — findByStatus chỉ trả về phòng OCCUPIED")
    void UC20_findByStatus_occupied_returnsOnlyOccupied() {
        Branch branch = createBranch("B4");
        RoomType rt = createRoomType("RT4");
        createRoom("R6", branch, rt, RoomStatus.OCCUPIED);
        createRoom("R7", branch, rt, RoomStatus.AVAILABLE);
        createRoom("R8", branch, rt, RoomStatus.RESERVED);

        List<Room> occupied = roomRepository.findByStatus(RoomStatus.OCCUPIED);
        assertEquals(1, occupied.size());
        assertEquals("R6", occupied.get(0).getId());
    }
}
