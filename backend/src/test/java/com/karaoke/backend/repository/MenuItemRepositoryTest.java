package com.karaoke.backend.repository;

import com.karaoke.backend.domain.MenuItem;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class MenuItemRepositoryTest {

    @Autowired
    private MenuItemRepository repository;

    private MenuItem createItem(String id, String name, String category) {
        MenuItem m = new MenuItem();
        m.setId(id);
        m.setName(name);
        m.setCategory(category);
        m.setPrice(new BigDecimal("30000"));
        m.setStock(10);
        m.setActive(true);
        return repository.save(m);
    }

    @Test
    void findByCategoryIgnoreCase_isCaseInsensitive() {
        createItem("M1", "Bia", "Do uong");
        createItem("M2", "Com", "Do an");
        createItem("M3", "Nuoc cam", "DO UONG");

        List<MenuItem> results = repository.findByCategoryIgnoreCase("do uong");
        assertEquals(2, results.size());
    }

    @Test
    void findByCategoryIgnoreCase_noResults_returnsEmpty() {
        createItem("M4", "Trai cay", "Trai cay");
        List<MenuItem> results = repository.findByCategoryIgnoreCase("Khac");
        assertTrue(results.isEmpty());
    }
}
