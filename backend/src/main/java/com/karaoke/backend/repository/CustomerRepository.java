package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, String> {
    boolean existsByPhone(String phone);
}
