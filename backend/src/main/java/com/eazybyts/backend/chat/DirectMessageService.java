package com.eazybyts.backend.chat;

import com.eazybyts.backend.user.UserEntity;
import com.eazybyts.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DirectMessageService {
    private final DirectMessageRepository dmRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    public DirectMessageService(DirectMessageRepository dmRepo,
                                UserRepository userRepo,
                                NotificationService notificationService) {
        this.dmRepo = dmRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
    }

    // ✅ Matches DirectMessagesController.getConversation(senderId, receiverId)
    public List<DirectMessageEntity> getConversation(String userAId, String userBId) {
        long a = Long.parseLong(userAId);
        long b = Long.parseLong(userBId);
        // naive filter to avoid extra repo method right now
        return dmRepo.findAll().stream()
                .filter(dm ->
                        (dm.getSender().getId() == a && dm.getRecipient().getId() == b) ||
                        (dm.getSender().getId() == b && dm.getRecipient().getId() == a)
                )
                .toList();
    }

    // ✅ Matches DirectMessagesController.saveDirectMessage(senderId, receiverId, content)
    @Transactional
    public DirectMessageEntity saveDirectMessage(String senderId, String recipientId, String content) {
        return save(senderId, recipientId, content);
    }

    // already used elsewhere
    @Transactional
    public DirectMessageEntity save(String senderId, String recipientId, String content) {
        Long sId = Long.parseLong(senderId);
        Long rId = Long.parseLong(recipientId);

        UserEntity sender = userRepo.findById(sId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found: " + senderId));
        UserEntity receiver = userRepo.findById(rId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found: " + recipientId));

        DirectMessageEntity dm = new DirectMessageEntity();
        dm.setSender(sender);
        dm.setReceiver(receiver);
        dm.setContent(content);

        DirectMessageEntity saved = dmRepo.save(dm);

        if (receiver.getFcmToken() != null && !receiver.getFcmToken().isBlank()) {
            String title = "New message from " + sender.getUsername();
            notificationService.sendToToken(receiver.getFcmToken(), title, content);
        }
        return saved;
    }
}
