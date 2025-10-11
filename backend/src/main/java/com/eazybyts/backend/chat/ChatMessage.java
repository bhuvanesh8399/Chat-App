package com.eazybyts.backend.chat;

import com.eazybyts.backend.user.UserEntity;
import java.time.Instant;
import java.util.List;

public class ChatMessage {
    private Long id;
    private Long roomId;        // for room messages
    private Long senderId;
    private Long recipientId;   // for DM
    private String content;
    private Instant timestamp;

    public ChatMessage() {}

    public ChatMessage(Long id, Long roomId, Long senderId, Long recipientId, String content, Instant timestamp) {
        this.id = id;
        this.roomId = roomId;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.content = content;
        this.timestamp = timestamp;
    }

    // ---------- Mappers ----------
    public static ChatMessage from(MessageEntity m) {
        return new ChatMessage(
                m.getId(),
                m.getRoom() != null ? m.getRoom().getId() : null,
                userId(m.getSender()),
                null,
                m.getContent(),
                m.getTimestamp()
        );
    }

    public static ChatMessage from(DirectMessageEntity dm) {
        return new ChatMessage(
                dm.getId(),
                null,
                userId(dm.getSender()),
                userId(dm.getRecipient()),   // note: treat "recipient" as DM target
                dm.getContent(),
                dm.getTimestamp()
        );
    }

    public static List<ChatMessage> fromMessages(List<MessageEntity> list) {
        return list.stream().map(ChatMessage::from).toList();
    }

    public static List<ChatMessage> fromDirectMessages(List<DirectMessageEntity> list) {
        return list.stream().map(ChatMessage::from).toList();
    }

    private static Long userId(UserEntity u) { return u != null ? u.getId() : null; }

    // ---------- Getters / Setters ----------
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
