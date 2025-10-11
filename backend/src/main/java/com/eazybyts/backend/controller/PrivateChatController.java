package com.eazybyts.backend.controller;

import com.eazybyts.backend.chat.ChatMessage;
import com.eazybyts.backend.chat.DirectMessageEntity;
import com.eazybyts.backend.chat.DirectMessageService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/private")
public class PrivateChatController {

    private final DirectMessageService dms;

    public PrivateChatController(DirectMessageService dms) {
        this.dms = dms;
    }

    // POST /api/private/send?senderId=1&receiverId=2&content=hi
    @PostMapping("/send")
    public ChatMessage send(@RequestParam String senderId,
                            @RequestParam String receiverId,
                            @RequestParam String content) {

        DirectMessageEntity saved = dms.saveDirectMessage(senderId, receiverId, content);

        // ✅ Map entity → DTO (uses timestamp internally)
        return ChatMessage.from(saved);
    }
}
