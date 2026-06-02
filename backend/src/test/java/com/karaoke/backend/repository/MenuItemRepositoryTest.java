package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ProductRepositoryTest {

    @Autowired
    private ProductRepository repository;

    private Product createProduct(String id, String name, String category, int stock) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setCategory(category);
        p.setPrice(new BigDecimal("30000"));
        p.setStock(stock);
        p.setSoLuongToiThieu(5);
        p.setActive(true);
        return repository.save(p);
    }

    @Test
    void findByCategoryIgnoreCase_isCaseInsensitive() {
        createProduct("P1", "Bia", "Do uong", 10);
        createProduct("P2", "Com", "Do an", 10);
        createProduct("P3", "Nuoc cam", "DO UONG", 10);

        List<Product> results = repository.findByCategoryIgnoreCase("do uong");
        assertEquals(2, results.size());
    }

    @Test
    void findByCategoryIgnoreCase_noResults_returnsEmpty() {
        createProduct("P4", "Trai cay", "Trai cay", 10);
        List<Product> results = repository.findByCategoryIgnoreCase("Khac");
        assertTrue(results.isEmpty());
    }

    @Test
    void findByStockLessThanEqualAndActiveTrue_filtersCorrectly() {
        createProduct("P5", "SapHet", "Do uong", 3);
        createProduct("P6", "ConNhieu", "Do uong", 20);
        createProduct("P7", "SapHet2", "Do an", 5);

        List<Product> lowStock = repository.findByStockLessThanEqualAndActiveTrue(5);
        assertEquals(2, lowStock.size());
        assertTrue(lowStock.stream().allMatch(p -> p.getStock() <= 5));
    }
}
