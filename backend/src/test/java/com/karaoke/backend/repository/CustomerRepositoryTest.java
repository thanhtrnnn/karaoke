package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Customer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class CustomerRepositoryTest {

    @Autowired
    private CustomerRepository repository;

    private Customer createCustomer(String id, String phone, String tier) {
        Customer c = new Customer();
        c.setId(id);
        c.setFullName("Customer " + id);
        c.setPhone(phone);
        c.setTier(tier);
        c.setPoints(0);
        return repository.save(c);
    }

    @Test
    void existsByPhone_true() {
        createCustomer("C1", "0901234567", "Dong");
        assertTrue(repository.existsByPhone("0901234567"));
    }

    @Test
    void existsByPhone_false() {
        assertFalse(repository.existsByPhone("0999999999"));
    }

    @Test
    void countByTier_returnsCorrectCounts() {
        createCustomer("C2", "0901111111", "Vang");
        createCustomer("C3", "0902222222", "Vang");
        createCustomer("C4", "0903333333", "Bac");

        assertEquals(2, repository.countByTier("Vang"));
        assertEquals(1, repository.countByTier("Bac"));
        assertEquals(0, repository.countByTier("Kim cuong"));
    }
}
