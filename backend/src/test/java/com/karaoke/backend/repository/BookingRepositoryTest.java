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

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private BranchRepository branchRepository;
    @Autowired
    private CustomerRepository customerRepository;

    private Branch createBranch(String id) {
        Branch b = new Branch();
        b.setId(id);
        b.setName("Branch " + id);
        return branchRepository.save(b);
    }

    private Room createRoom(String id, Branch branch) {
        Room r = new Room();
        r.setId(id);
        r.setName("Room " + id);
        r.setType("VIP");
        r.setCapacity(10);
        r.setHourlyPrice(new BigDecimal("100000"));
        r.setStatus(RoomStatus.AVAILABLE);
        r.setBranch(branch);
        r.setActive(true);
        return roomRepository.save(r);
    }

    private Customer createCustomer(String id, String phone) {
        Customer c = new Customer();
        c.setId(id);
        c.setFullName("Test Customer");
        c.setPhone(phone);
        c.setTier("Dong");
        c.setPoints(0);
        return customerRepository.save(c);
    }

    private Booking createBooking(String id, Customer customer, Room room, BookingStatus status) {
        Booking b = new Booking();
        b.setId(id);
        b.setCustomer(customer);
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
        Customer customer = createCustomer("C1", "0901111111");
        createBooking("BK1", customer, room, BookingStatus.CONFIRMED);
        createBooking("BK2", customer, room, BookingStatus.PENDING);

        List<Booking> confirmed = bookingRepository.findByStatus(BookingStatus.CONFIRMED);
        assertFalse(confirmed.isEmpty());
        confirmed.forEach(b -> assertEquals(BookingStatus.CONFIRMED, b.getStatus()));
    }

    @Test
    void findByStatus_noResults_returnsEmpty() {
        List<Booking> cancelled = bookingRepository.findByStatus(BookingStatus.CANCELLED);
        assertTrue(cancelled.isEmpty());
    }
}
