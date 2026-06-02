package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Employee;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, String> {
    List<Employee> findByBranchId(String branchId);
    boolean existsByBranchId(String branchId);
}
