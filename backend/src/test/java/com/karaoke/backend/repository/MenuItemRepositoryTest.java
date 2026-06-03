package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Product;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("Product Repository — UC06: Truy vấn sản phẩm")
class ProductRepositoryTest {

    @Autowired
    private ProductRepository repository;

    private Product createProduct(String id, String name, String category, int currentStock) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setCategory(category);
        p.setPrice(new BigDecimal("30000"));
        p.setCurrentStock(currentStock);
        p.setSafetyStock(5);
        p.setActive(true);
        return repository.save(p);
    }

    @Test
    @DisplayName("UC06 — findByCategoryIgnoreCase phân biệt không phân biệt chữ hoa/thường")
    void UC06_findByCategoryIgnoreCase_isCaseInsensitive() {
        createProduct("P1", "Bia", "Do uong", 10);
        createProduct("P2", "Com", "Do an", 10);
        createProduct("P3", "Nuoc cam", "DO UONG", 10);

        List<Product> results = repository.findByCategoryIgnoreCase("do uong");
        assertEquals(2, results.size());
    }

    @Test
    @DisplayName("UC06 — findByCategoryIgnoreCase trả về rỗng khi không khớp")
    void UC06_findByCategoryIgnoreCase_noResults_returnsEmpty() {
        createProduct("P4", "Trai cay", "Trai cay", 10);
        List<Product> results = repository.findByCategoryIgnoreCase("Khac");
        assertTrue(results.isEmpty());
    }

    @Test
    @DisplayName("UC06 — Tìm sản phẩm tồn kho thấp (≤ safetyStock) lọc đúng")
    void UC06_findByCurrentStockLessThanEqualAndActiveTrue_filtersCorrectly() {
        createProduct("P5", "SapHet", "Do uong", 3);
        createProduct("P6", "ConNhieu", "Do uong", 20);
        createProduct("P7", "SapHet2", "Do an", 5);

        List<Product> lowStock = repository.findByCurrentStockLessThanEqualAndActiveTrue(5);
        assertEquals(2, lowStock.size());
        assertTrue(lowStock.stream().allMatch(p -> p.getCurrentStock() <= 5));
    }
}
