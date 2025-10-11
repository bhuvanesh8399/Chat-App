package com.eazybyts.backend.chat;

import com.eazybyts.backend.user.UserEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "messages")
public class MessageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private UserEntity sender;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private RoomEntity room;

    @Column(nullable = false, length = 4000)
    private String content;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    public MessageEntity() {}

    public Long getId() { return id; }

    public UserEntity getSender() { return sender; }
    public void setSender(UserEntity sender) { this.sender = sender; }

    public RoomEntity getRoom() { return room; }
    public void setRoom(RoomEntity room) { this.room = room; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    // ✅ Some controller calls getCreatedAt()
    public Instant getCreatedAt() { return timestamp; }
}
