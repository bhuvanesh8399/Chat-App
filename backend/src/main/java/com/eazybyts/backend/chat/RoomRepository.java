package com.eazybyts.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<RoomEntity, Long> {
    // ✅ Find room by name (used by RoomsController)
    Optional<RoomEntity> findByName(String name);
}
