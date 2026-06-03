package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Product;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByCategoryIgnoreCase(String category);
    List<Product> findByCurrentStockLessThanEqualAndActiveTrue(int currentStock);
    List<Product> findByNameContainingIgnoreCase(String name);
}
