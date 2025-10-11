package com.eazybyts.backend.chat;

import com.eazybyts.backend.user.UserEntity;
import com.eazybyts.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessageService {
    private final MessageRepository messageRepo;
    private final RoomRepository roomRepo;
    private final UserRepository userRepo;

    public MessageService(MessageRepository messageRepo, RoomRepository roomRepo, UserRepository userRepo) {
        this.messageRepo = messageRepo;
        this.roomRepo = roomRepo;
        this.userRepo = userRepo;
    }

    // ✅ Matches controller signature
    public List<MessageEntity> getMessagesForRoom(Long roomId) {
        return messageRepo.findByRoom_Id(roomId);
    }

    // ✅ Wrapper that matches controller; delegates to saveToRoom
    @Transactional
    public MessageEntity saveMessage(Long roomId, String senderId, String content) {
        return saveToRoom(String.valueOf(roomId), senderId, content);
    }

    // Already used by another controller: keep it
    @Transactional
    public MessageEntity saveToRoom(String roomId, String senderId, String content) {
        Long rId = Long.parseLong(roomId);
        Long sId = Long.parseLong(senderId);

        RoomEntity room = roomRepo.findById(rId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));
        UserEntity sender = userRepo.findById(sId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + senderId));

        MessageEntity m = new MessageEntity();
        m.setRoom(room);
        m.setSender(sender);
        m.setContent(content);
        return messageRepo.save(m);
    }
}
