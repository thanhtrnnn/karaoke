package com.karaoke.backend.repository;

import com.karaoke.backend.domain.MenuItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, String> {
    List<MenuItem> findByCategoryIgnoreCase(String category);
}
