package com.eazybyts.backend.chat;

import com.eazybyts.backend.user.UserEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "direct_messages")
public class DirectMessageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private UserEntity sender;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private UserEntity receiver;

    @Column(nullable = false, length = 4000)
    private String content;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    public Long getId() { return id; }

    public UserEntity getSender() { return sender; }
    public void setSender(UserEntity sender) { this.sender = sender; }

    public UserEntity getReceiver() { return receiver; }
    public void setReceiver(UserEntity receiver) { this.receiver = receiver; }

    // ✅ compatible alias used elsewhere
    public UserEntity getRecipient() { return receiver; }
    public void setRecipient(UserEntity recipient) { this.receiver = recipient; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
