package com.karaoke.backend.repository;

import com.karaoke.backend.domain.ApplyPromotion;
import com.karaoke.backend.domain.RoomReceipt;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplyPromotionRepository extends JpaRepository<ApplyPromotion, Long> {
    List<ApplyPromotion> findByRoomReceipt(RoomReceipt roomReceipt);
}
