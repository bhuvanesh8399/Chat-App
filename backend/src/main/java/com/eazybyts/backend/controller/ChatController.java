package com.eazybyts.backend.controller;

import com.eazybyts.backend.chat.MessageService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller("roomChatController")
public class ChatController {
  private final SimpMessagingTemplate broker;
  private final MessageService messages;

  public ChatController(SimpMessagingTemplate broker, MessageService messages) {
    this.broker = broker; this.messages = messages;
  }

  @MessageMapping("/chat/{room}")
  public void handleChat(@DestinationVariable String room,
                         Map<String, Object> payload,
                         Authentication auth) {
    String sender = (auth != null && auth.getName() != null) ? auth.getName() : "anonymous";
    String content = String.valueOf(payload.get("content"));
    var saved = messages.saveToRoom(room, sender, content);

    Map<String, Object> out = Map.of(
      "id", saved.getId(),
      "room", room,
      "sender", saved.getSender(),
      "content", saved.getContent(),
      "createdAt", saved.getCreatedAt().toString()
    );
    broker.convertAndSend("/topic/room." + room, out);

    
  }
 
@MessageMapping("/typing/{room}")
public void typing(@DestinationVariable String room, Authentication auth) {
  String user = (auth != null && auth.getName()!=null) ? auth.getName() : "someone";
  // Broadcast "user is typing" to the room (clients can debounce)
  broker.convertAndSend("/topic/typing." + room, Map.of("user", user));
}

}
