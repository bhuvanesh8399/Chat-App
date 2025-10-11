package com.eazybyts.backend.chat;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dm")
public class DirectMessagesController {

    private final DirectMessageService directMessageService;

    public DirectMessagesController(DirectMessageService directMessageService) {
        this.directMessageService = directMessageService;
    }

    // GET /api/dm/conversation?userA=1&userB=2
    @GetMapping("/conversation")
    public List<ChatMessage> conversation(@RequestParam String userA,
                                          @RequestParam String userB) {
        return ChatMessage.fromDirectMessages(directMessageService.getConversation(userA, userB));
    }

    // POST /api/dm/send?senderId=1&receiverId=2&content=hi
    @PostMapping("/send")
    public ChatMessage send(@RequestParam String senderId,
                            @RequestParam String receiverId,
                            @RequestParam String content) {
        DirectMessageEntity saved = directMessageService.saveDirectMessage(senderId, receiverId, content);
        return ChatMessage.from(saved);
    }
}
