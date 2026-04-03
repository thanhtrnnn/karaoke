package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Branch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BranchRepository extends JpaRepository<Branch, String> {
}
