package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Client;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ClientRepositoryTest {

    @Autowired
    private ClientRepository repository;

    private Client createClient(String id, String phone, String tier) {
        Client c = new Client();
        c.setId(id);
        c.setFullName("Client " + id);
        c.setPhone(phone);
        c.setTier(tier);
        c.setLoyaltyPoints(0);
        return repository.save(c);
    }

    @Test
    void existsByPhone_true() {
        createClient("C1", "0901234567", "Dong");
        assertTrue(repository.existsByPhone("0901234567"));
    }

    @Test
    void existsByPhone_false() {
        assertFalse(repository.existsByPhone("0999999999"));
    }

    @Test
    void countByTier_returnsCorrectCounts() {
        createClient("C2", "0901111111", "Vang");
        createClient("C3", "0902222222", "Vang");
        createClient("C4", "0903333333", "Bac");

        assertEquals(2, repository.countByTier("Vang"));
        assertEquals(1, repository.countByTier("Bac"));
        assertEquals(0, repository.countByTier("Kim cuong"));
    }
}
