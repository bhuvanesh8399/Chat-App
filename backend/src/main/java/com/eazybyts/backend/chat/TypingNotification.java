// src/main/java/com/eazybyts/backend/chat/TypingNotification.java
package com.eazybyts.backend.chat;

public class TypingNotification {
    private String username;   // user who is typing
    private Long roomId;       // if typing in a room
    private String targetUser; // if typing in a direct chat

    public TypingNotification() {}
    public TypingNotification(String username, Long roomId, String targetUser) {
        this.username = username;
        this.roomId = roomId;
        this.targetUser = targetUser;
    }
    // Getters and setters...
}
