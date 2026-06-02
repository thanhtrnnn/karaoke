package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Client;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClientRepository extends JpaRepository<Client, String> {
    boolean existsByPhone(String phone);
    long countByTier(String tier);
    Optional<Client> findByPhone(String phone);

    @Query("SELECT c FROM Client c WHERE " +
           "(:keyword IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR c.phone LIKE CONCAT('%', :keyword, '%'))")
    List<Client> searchByKeyword(@Param("keyword") String keyword);
}
