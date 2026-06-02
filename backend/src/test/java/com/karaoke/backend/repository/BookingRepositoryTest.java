package com.karaoke.backend.repository;

import com.karaoke.backend.domain.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class BookingRepositoryTest {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private BranchRepository branchRepository;
    @Autowired private ClientRepository clientRepository;
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

    private Room createRoom(String id, Branch branch) {
        RoomType rt = createRoomType("RT-" + id);
        Room r = new Room();
        r.setId(id);
        r.setName("Room " + id);
        r.setRoomType(rt);
        r.setCapacity(10);
        r.setPrice(new BigDecimal("100000"));
        r.setStatus(RoomStatus.AVAILABLE);
        r.setBranch(branch);
        r.setActive(true);
        return roomRepository.save(r);
    }

    private Client createClient(String id, String phone) {
        Client c = new Client();
        c.setId(id);
        c.setFullName("Test Client");
        c.setPhone(phone);
        c.setTier("Dong");
        c.setLoyaltyPoints(0);
        return clientRepository.save(c);
    }

    private Booking createBooking(String id, Client client, Room room, BookingStatus status) {
        Booking b = new Booking();
        b.setId(id);
        b.setCustomer(client);
        b.setRoom(room);
        b.setStartTime(LocalDateTime.now().plusHours(1));
        b.setEndTime(LocalDateTime.now().plusHours(3));
        b.setGuestCount(5);
        b.setStatus(status);
        return bookingRepository.save(b);
    }

    @Test
    void findByStatus_filtersCorrectly() {
        Branch branch = createBranch("B1");
        Room room = createRoom("R1", branch);
        Client client = createClient("C1", "0901111111");
        createBooking("BK1", client, room, BookingStatus.CONFIRMED);
        createBooking("BK2", client, room, BookingStatus.PENDING);

        List<Booking> confirmed = bookingRepository.findByStatus(BookingStatus.CONFIRMED);
        assertFalse(confirmed.isEmpty());
        confirmed.forEach(b -> assertEquals(BookingStatus.CONFIRMED, b.getStatus()));
    }

    @Test
    void findByStatus_noResults_returnsEmpty() {
        List<Booking> cancelled = bookingRepository.findByStatus(BookingStatus.CANCELLED);
        assertTrue(cancelled.isEmpty());
    }

    @Test
    void findByStatus_checkedIn_returnsOnlyCheckedIn() {
        Branch branch = createBranch("B2");
        Room room = createRoom("R2", branch);
        Client client = createClient("C2", "0902222222");
        createBooking("BK3", client, room, BookingStatus.CHECKED_IN);
        createBooking("BK4", client, room, BookingStatus.CONFIRMED);

        List<Booking> checkedIn = bookingRepository.findByStatus(BookingStatus.CHECKED_IN);
        assertEquals(1, checkedIn.size());
        assertEquals("BK3", checkedIn.get(0).getId());
    }

    @Test
    void booking_persistsClientAndRoom() {
        Branch branch = createBranch("B3");
        Room room = createRoom("R3", branch);
        Client client = createClient("C3", "0903333333");
        createBooking("BK5", client, room, BookingStatus.CONFIRMED);

        Booking found = bookingRepository.findById("BK5").orElseThrow();
        assertNotNull(found.getCustomer());
        assertEquals("C3", found.getCustomer().getId());
        assertNotNull(found.getRoom());
        assertEquals("R3", found.getRoom().getId());
    }
}
