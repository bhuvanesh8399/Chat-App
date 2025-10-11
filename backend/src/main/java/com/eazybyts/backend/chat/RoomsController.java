// src/main/java/com/eazybyts/backend/chat/RoomsController.java
package com.eazybyts.backend.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin
public class RoomsController {
    @Autowired private RoomRepository roomRepository;

    // List all chat rooms
    @GetMapping
    public List<RoomEntity> getAllRooms() {
        return roomRepository.findAll();
    }

    // Create a new chat room
    @PostMapping
    public RoomEntity createRoom(@RequestBody RoomEntity room) {
        if (roomRepository.findByName(room.getName()).isPresent()) {
            throw new RuntimeException("Room already exists");
        }
        return roomRepository.save(new RoomEntity(room.getName()));
    }
}
