package com.eazybyts.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<MessageEntity, Long> {
    // ✅ Used by MessageService.getMessagesForRoom
    List<MessageEntity> findByRoom_Id(Long roomId);
}
