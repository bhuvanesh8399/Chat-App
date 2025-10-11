package com.eazybyts.backend.chat;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessagesController {

    private final MessageService messageService;

    public MessagesController(MessageService messageService) {
        this.messageService = messageService;
    }

    // GET /api/messages/room/{roomId}
    @GetMapping("/room/{roomId}")
    public List<ChatMessage> getMessagesForRoom(@PathVariable Long roomId) {
        return ChatMessage.fromMessages(messageService.getMessagesForRoom(roomId));
    }

    // POST /api/messages/room/{roomId}
    @PostMapping("/room/{roomId}")
    public ChatMessage sendToRoom(@PathVariable Long roomId,
                                  @RequestParam String senderId,
                                  @RequestParam String content) {
        MessageEntity saved = messageService.saveMessage(roomId, senderId, content);
        return ChatMessage.from(saved);
    }
}
